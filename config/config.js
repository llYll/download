module.exports= {
    redis: {
        port: 6379, // Redis port
        host: 'r-bp11x9tztz0r6k8btmpd.redis.rds.aliyuncs.com',
        password: 'kdv8XbhTKMQH2Na0',
        family: 4,
        db: 0,
        channel:'download'
    },
    workerName:{
        down:'downworker',
        docker:'dockerworker'
    },
    mysql: {
        user: 'diancunkeji',
        password: 'kdv8XbhTKMQH2Na0',
        database: 'dragonfly',
        orm: {
            dialect: 'mysql',
            host: 'rm-bp1xrqx7066jkecifwo.mysql.rds.aliyuncs.com',
            port: 3306,
            query: {
                raw: true,
            },
            pool: {
                max: 10000,
                min: 0,
                idle: 10000,
                handleDisconnects: true,
            },
            dialectOptions: {
                connectTimeout: 10000,
                dateStrings: true,
                typeCast: true,
            },
            timezone: '+08:00',
            logging: true,
        },
    },
}
