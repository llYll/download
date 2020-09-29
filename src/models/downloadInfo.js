'use strict';

const {Sequelize, pool} = require('./index');

const Model = Sequelize.Model;

class Download extends Model {}
Download.init({
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键',
    },
    type: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '下载类型（0 url,1 dockerHub）',
    },
    url: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '下载地址',
    },
    downloadStatus: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '下载状态（0未开始，1开始下载，2下载完成，3下载失败）',
    },
    pushStatus: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '上传状态（0未开始 1等待上传 2上传完成 3上传失败）',
    },
    saveAddress: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '文件磁盘保存地址',
    },
    cid: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ipfs 唯一标识',
    },
    errorMsg: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '错误信息',
    },
    createdAt: {
        type: Sequelize.DATE,
        comment: '创建时间',
    },
    updatedAt: {
        type: Sequelize.DATE,
        comment: '创建时间',
    },
}, {
    // Sequelize 实例
    sequelize: pool,
    // 不添加时间戳属性
    timestamps: false,
    // 表名称
    tableName: 'download_info',
    // 禁用修改表名
    freezeTableName: true,
});


/**
 * 更新上传状态
 * @param {Object} where
 * @returns {Promise<[number, any[]]}
 */
exports.update = async (data, where) => {
    const res = await Download.update(
        data,
        {
            where,
        },
    );
    return res;
};
