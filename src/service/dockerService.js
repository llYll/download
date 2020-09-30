const cp = require('child_process');

const pullImage = function (imageName, tag = 'latest') {
    // 在指令执行完毕后执行回调函数，返回缓冲区内存保存的执行结果
    const stdout = cp.execSync(`docker pull ${imageName}:${tag}`);
    return stdout;
};

const saveImage = function ({
                                savePath,
                                saveFileName,
                                imagesName,
                                imageTag = 'latest',
                            }) {
    // 在指令执行完毕后执行回调函数，返回缓冲区内存保存的执行结果
    const execShell = `docker save -o ./${saveFileName}.tar  ${imagesName}:${imageTag}`;
    console.log('execShell ', execShell);
    const stdout = cp.execSync(execShell, { cwd: savePath });
    return stdout;
};

const delImage = function (imageName, tag = 'latest') {
    // 在指令执行完毕后执行回调函数，返回缓冲区内存保存的执行结果
    const stdout = cp.execSync(`docker rmi  ${imageName}:${tag}`);
    console.log('删除完成')
    return stdout;
};

module.exports = {
    pullImage,
    saveImage,
    delImage,
};
