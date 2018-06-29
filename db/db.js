const mongoose = require('mongoose');
const logger = require('../logging/logger');
const config = require('../config/develop');
const autoIncrement = require('mongoose-auto-increment');

mongoose.connect(config.url, {useMongoClient: true});
const db = mongoose.connection;
autoIncrement.initialize(db);
mongoose.Promise = global.Promise;

db.once('open', () => {
    logger.info('Connected with DB');
    logger.trace('Host:' + db.host
        + ' port: ' + db.host, ' user: '
        + db.user);
    console.log('Connected with DB');
});

db.on('error', (error) => {
    logger.error(error);
    logger.trace('Host:' + db.host
        + ' port: ' + db.host, ' user: '
        + db.user + ' pass: ' + db.pass +
        ' name: ' + db.name);
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('close', (info) => {
    console.log('Disconnected');
    logger.warn('Db has disconnected: ' + info);
    mongoose.connect(config.url, {server: {auto_reconnect: true}});
});
module.exports.mongoose = mongoose;
