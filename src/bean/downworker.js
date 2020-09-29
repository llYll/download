const { downLoad } = require('../service/downService');

process.on('message',async (url)=>{
    const result = await downLoad(url);
    console.log('下载成功')
    process.send(JSON.stringify({result:result}));
})
process.on('exit', function () {
    setTimeout(function () {
        console.log('This will not run');
    }, 100);
    console.log('Bye.');
});
process.on('uncaughtException', function(e) {
    console.log(e);
});
