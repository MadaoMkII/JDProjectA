const log4js = require('log4js');
log4js.configure({
    appenders: {OrderFormLog: {type: 'file', filename: 'orderFormLog.log'}},
    categories: {default: {appenders: ['OrderFormLog'], level: 'trace'}}
});

const logger = log4js.getLogger('OrderFormLog');

module.exports = logger;