const mongoose = require('mongoose');
const logger = require('../logging/logger');
const config = require('../config/develop');
const autoIncrement = require('mongoose-auto-increment');
const Grid = require('gridfs-stream');


const mongodbUri = config.url;
const options = {
    poolSize: 6,
    useMongoClient: true,
    keepAlive: true
};


// const db = mongoose.connect(mongodbUri, options);
const db = mongoose.createConnection(mongodbUri);
autoIncrement.initialize(db);
mongoose.Promise = global.Promise;
let gfs = Grid(db.db, mongoose.mongo);
gfs.collection('images');

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
    logger.warn('Db has dissconnected: ' + info);
});

module.exports.mongoose = mongoose;
module.exports.gfs = gfs;