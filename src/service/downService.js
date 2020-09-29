const axios = require('axios');
const enumList = require('../enum/enum')

const fs = require('fs');
const path = require("path")

function getFile(url){
    const index=url.lastIndexOf("/");
    const fileName = url.substring(index+1,url.length);
    return fileName;
}

module.exports = {
    downLoad:
        async function(id,url) {
            const fileName = getFile(url);
            const downPath = './source'+fileName;
            const outPath = path.join(__dirname,'../','./source',fileName);
            const writer = fs.createWriteStream(outPath);
            await download.update({
                downloadStatus: enumList.DOWNLOAD_STATUS.START,
            },{
                id,
            })
            const result = await axios({
                url:url,
                method: 'GET',
                responseType: 'stream'
            })
            result.data.pipe(writer);
            console.log('work 开始下载,url:',url);
            return new Promise((resolve, reject) => {
                writer.on("finish", async function () {
                    console.log(`url :${url}下载完成`)
                    await download.update({
                        downloadStatus: enumList.DOWNLOAD_STATUS.FINISH,
                    },{
                        id,
                    })
                    resolve();
                });
                writer.on("error", async function (error) {
                    console.error(`url: ${url}下载失败，原因: `, error)
                    await download.update({
                        downloadStatus: enumList.DOWNLOAD_STATUS.FAILED,
                    },{
                        id,
                    })
                    reject();
                });
            });
    }
}


