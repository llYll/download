const childProcess = require('child_process');
const path = require('path');
const enumList = require('./src/enum/enum')
const Redis = require('ioredis');
const config = require('./config/config');
const db = require('./src/models');
const client = new Redis(config.redis);
const { Master } = require('./src/bean/master')

const  download= require('./src/models/downloadInfo');

const master = new Master();

client.subscribe(config.redis.channel, (e) => {
    console.log('subscribe channel: ', e);
    // processManger.assignments(e);
});

// 监听 发来的消息
client.on('message', (channel, message) => {
    if(message){
        console.log('开始接受订阅消息，开始下载任务',message);
        master.assignments(message);
    }
    console.log(`channel: ${channel}, message: ${message}`);
});

// 监听 错误
client.on("error", (err) => {
    console.log("response err:" + err);
});

process.on("SIGINT",async function () {
    await download.update({
        downloadStatus: enumList.DOWNLOAD_STATUS.INIT
    },{
        downloadStatus: enumList.DOWNLOAD_STATUS.START
    })
    //打印出错误
    console.log("进程强制退出  ");
    process.exit(1)
})
