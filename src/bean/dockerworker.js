const { pullImage,saveImage,delImage } = require('../service/dockerService');
const path = require('path');
const  download= require('../models/downloadInfo');
const enumList = require('../enum/enum')
const fs = require('fs');
let workid = -1;

/**
 * 接受消息开始
 */
process.on('message',async (info)=>{
    process.send(JSON.stringify({
        type:enumList.Communication.LOG,
        data:`work接收到的任务:${info}`
    }));
    const data = JSON.parse(info);
    const id = data.id;
    try {
        workid = data.index;
        let savePath = data.index % 11;
        if(savePath == 0){
            savePath = 11;
        }
        await download.update({
            downloadStatus: enumList.DOWNLOAD_STATUS.START,
        },{
            id,
        })
        const url = data.url;
        const imageInfo = url.split(':');
        if(workid < 0){
            process.send(JSON.stringify({
                type:enumList.Communication.ERROR,
                data:`未指定挂载盘`
            }));
            return ;
        }
        if(! fs.existsSync(`/data${savePath}/source`)){
            fs.mkdirSync(`/data${savePath}/source`)
        }
        const outPath = path.join(`/data${savePath}`,'./','source');

        process.send(JSON.stringify({
            type:enumList.Communication.LOG,
            data:`镜像${imageInfo[0]+'-'+imageInfo[1]}存储位置: ${outPath}`
        }));

        process.send(JSON.stringify({
            type:enumList.Communication.LOG,
            data:`开始pull 镜像`
        }));

        pullImage(imageInfo[0],imageInfo[1]);

        process.send(JSON.stringify({
            type:enumList.Communication.LOG,
            data:`pull 镜像  结束`
        }));
        process.send(JSON.stringify({
            type:enumList.Communication.LOG,
            data:`开始导出images`
        }));
        saveImage({
            savePath:outPath,
            saveFileName:imageInfo[0]+'-'+imageInfo[1],
            imagesName:imageInfo[0],
            imageTag:imageInfo[1]
        });
        process.send(JSON.stringify({
            type:enumList.Communication.LOG,
            data:`导出images 结束`
        }));

        await download.update({
            downloadStatus:enumList.DOWNLOAD_STATUS.FINISH,
            saveAddress: `./source/${imageInfo[0]+'-'+imageInfo[1]}.tar`
        },{
            id,
        })
    }catch (e) {
        process.send(JSON.stringify({
            type:enumList.Communication.ERROR,
            data:`docker 打包存储异常：,${e.message}`,
            stack:`${e.stack}`
        }));
        await download.update({
            downloadStatus:enumList.DOWNLOAD_STATUS.FAILED
        },{
            id,
        })
    }finally {
        process.send(JSON.stringify({
            type:enumList.Communication.RESULT,
            data:`over`
        }));
    }
})

/**
 * 退出
 */
process.on('exit', function () {
    setTimeout(function () {
        console.log('This work will not run');
    }, 100);
});

/**
 * 异常
 */
process.on('uncaughtException', function(e) {
    console.error("the work error:",e);
});
