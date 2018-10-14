const winston = require('winston');
const config = require('../config/develop');
require('winston-mongodb').MongoDB;

winston.loggers.add('runningLog', {
    transports: [
        new (winston.transports.MongoDB)({
            db: config.url,
            collection: 'runningLog',
            capped: true
        }),
    ]
});


const mongoLog = winston.loggers.get('runningLog');

exports.logger = mongoLog;
