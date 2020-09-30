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
    console.log("work接收到的任务",info);
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
            console.error('未指定挂载盘')
            return ;
        }
        if(! fs.existsSync(`/data${savePath}/source`)){
            fs.mkdirSync(`/data${savePath}/source`)
        }
        const outPath = path.join(`/data${savePath}`,'./','source');
        console.log(`镜像${imageInfo[0]+'-'+imageInfo[1]}存储位置`,outPath);

        pullImage(imageInfo[0],imageInfo[1]);
        saveImage({
            savePath:outPath,
            saveFileName:imageInfo[0]+'-'+imageInfo[1],
            imagesName:imageInfo[0],
            imageTag:imageInfo[1]
        });
        await download.update({
            downloadStatus:enumList.DOWNLOAD_STATUS.FINISH,
            saveAddress: `./source/${imageInfo[0]+'-'+imageInfo[1]}`
        },{
            id,
        })
    }catch (e) {
        console.error("docker 打包存储异常：",e);
        await download.update({
            downloadStatus:enumList.DOWNLOAD_STATUS.FAILED
        },{
            id,
        })
    }finally {
        process.send("over")
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
