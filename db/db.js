const mongoose = require('mongoose');
const logger = require('../logging/logger');
const config = require('../config/develop');
const autoIncrement = require('mongoose-auto-increment');


const mongodbUri = config.url;
const options = {
    poolSize: 6,
    useMongoClient: true,
    keepAlive: true
};

const connection = mongoose.connection;
mongoose.connect(mongodbUri, options);
if (connection !== "undefined") {
    console.log(connection.readyState.toString());
    connection.once("open", () => {
        console.log('Host:' + db.host
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
    console.trace('Host:' + db.host
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
