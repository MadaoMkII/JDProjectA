const mongoose = require('mongoose');
const logger = require('./logging/logger');
const config = require('./config/develop');
const autoIncrement = require('mongoose-auto-increment');

const mongodbUri = `mongodb://root:hothothot2@dds-3ns4adb9c4a4e0641.mongodb.rds.aliyuncs.com:3717,dds-3ns4adb9c4a4e0642.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-9624007`;
const options = {
    poolSize: 6,
    useMongoClient: true,
    keepAlive: true
};

const connection = mongoose.connection;
mongoose.connect(mongodbUri, options);
if (connection !== "undefined") {
    //console.log(connection.readyState.toString());
    connection.once("open", () => {
        logger.log('Host:' + db.host
            + ' port: ' + db.host, ' user: '
            + db.user + ' pass: ' + db.pass +
            ' name: ' + db.name);
        console.log("Connection Open");
    });
} else {

    console.log('Sorry not connected');
}

let db = mongoose.connection;

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
    logger.warn('Db has dissconnected: ' + info);
});
autoIncrement.initialize(mongoose.connection);
mongoose.Promise = global.Promise;
module.exports.mongoose = mongoose;