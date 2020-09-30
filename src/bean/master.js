const childProcess = require('child_process');
const path = require('path');
const os = require('os');
const config = require('../../config/config');
const enumList = require('../enum/enum');

Array.prototype.remove = function(val) {
    let index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};


function getJsonLength(jsonData) {
    let length = 0;
    for (let ever in jsonData) {
        length++;
    }
    return length;
}
/**
 * 分配进程
 * @param urls
 */
class Master{
    constructor() {
        this.cpuNum = 10;
        this.workCPU = {};
        this.freeCPU = {};
    }

    /**
     * 调度进程接口
     * @param type
     * @param urls
     * @returns {boolean}
     */
    assignments(data){
        const list = JSON.parse(data);
        const freeCpu = (getJsonLength(this.workCPU) + getJsonLength(this.freeCPU));
        if(freeCpu > this.cpuNum){
            console.error('线程超标');
            console.error('忙碌进程数：',JSON.stringify(this.workCPU));
            console.error('空闲进程数：',JSON.stringify(this.freeCPU));
            return ;
        }
        console.log("目前能执行的进程数量:",(this.cpuNum - getJsonLength(this.workCPU)));
        for(let i = 0; i < (this.cpuNum - getJsonLength(this.workCPU)); i++){
            console.log("忙碌机子数量>>>>",getJsonLength(this.workCPU));
            console.log("空闲机子数量>>>>",getJsonLength(this.freeCPU));
            if(i>=list.length){
                break;
            }
            this.startWork(i,list[i]);
        }
    }


    /**
     * 子进程开始工作
     * @param type
     * @param url
     */
    startWork(index,info){

        try {
        let workPath = '';
        console.log(info);
        if(info.type === enumList.TASK_TYPE.URL){
            workPath = path.join(__dirname,`./${config.workerName.down}`)
        } else if(info.type === enumList.TASK_TYPE.DOCKER){
            workPath = path.join(__dirname,`./${config.workerName.docker}`);
        }
        console.log("work类型:",workPath)
        let work;
        // 筛选worker
        if(getJsonLength(this.freeCPU) > 0 ){
            for(let key in this.freeCPU){
                work = this.freeCPU[key];
                break;
            }
            console.log('使用空闲进程号为',work.pid);
        }else{
            console.log('创建新的一个子线程,空闲进程数量为',getJsonLength(this.freeCPU))
            work = childProcess.fork(workPath);
        }
        const workInfo = {};
        workInfo[work.pid] = work;
        this.workCPU[work.pid] = work;
        delete this.freeCPU[work.pid];
        console.log(`>>>>>>新来一个任务，任务类型${info.type} 新建一个线程pid:`, work.pid);
        info.index = index + 1 ;
        work.send(JSON.stringify(info));
        work.on('message',(msg) =>{
            console.log(`work：${work.pid}，执行任务${info}传回信息:`,msg)
            delete this.workCPU[work.pid];
            this.freeCPU[work.pid] = work;
        })
        work.on('close',(code)=>{
            delete this.workCPU[work.pid];
            delete this.freeCPU[work.pid];
            console.log(`work close pid: ${work.pid},code: `,code);
        })
        work.on('exit',(code)=>{
            delete this.workCPU[work.pid];
            delete this.freeCPU[work.pid];
            console.log(`work exit pid: ${work.pid},code: `,code);
        })
        }catch (e) {
            console.error(e);
        }
    }
}

module.exports = {
    Master
};
