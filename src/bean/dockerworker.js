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
        if(! fs.existsSync(`/data${workid}/source`)){
            fs.mkdirSync(`/data${workid}/source`)
        }
        const outPath = path.join(`/data${workid}`,'./','source');

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
        console.error(e);
        await download.update({
            downloadStatus:enumList.DOWNLOAD_STATUS.FAILED
        },{
            id,
        })
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
