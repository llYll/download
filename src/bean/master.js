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


/**
 * 分配进程
 * @param urls
 */
class Master{
    constructor() {
        this.cpuNum = 1;
        this.workCPU = [];
        this.freeCPU = [];
    }

    /**
     * 调度进程接口
     * @param type
     * @param urls
     * @returns {boolean}
     */
    assignments(data){
        const list = JSON.parse(data);

        if(list.length + this.workCPU.length > this.cpuNum){
            console.error("指定任务过多，达到上限")
            return false;
        }
        for(let i = 0; i<list.length; i++){
            console.log("忙碌机子数量>>>>",this.workCPU.length);
            console.log("空闲机子数量>>>>",this.freeCPU.length);
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

        if(info.type === enumList.TASK_TYPE.URL){
            workPath = path.join(__dirname,`./${config.workerName.down}`)
        } else if(info.type === enumList.TASK_TYPE.DOCKER){
            workPath = path.join(__dirname,`./${config.workerName.docker}`);
        }
        let work;
        // 筛选worker
        if(this.freeCPU.length > 0 ){
            work = this.freeCPU[0];
            this.freeCPU.remove(work);
        }else{
            work = childProcess.fork(workPath);
        }
        this.workCPU.push(work);
        console.log(`>>>>>>新来一个任务，任务类型${info.type} 新建一个线程pid:`, work.pid);
        info.index = index + 1 ;
        work.send(JSON.stringify(info));
        work.on('message',(msg) =>{
            console.log(`work：${work.pid}，执行任务${info}传回信息:`,msg)
            this.workCPU.remove(work);
            this.freeCPU.push(work);
        })
        work.on('close',(code)=>{
            this.workCPU.remove(work);
            this.freeCPU.remove(work);
            console.log(`work close pid: ${work.pid},code: `,code);
        })
        work.on('exit',(code)=>{
            this.workCPU.remove(work);
            this.freeCPU.remove(work);
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
