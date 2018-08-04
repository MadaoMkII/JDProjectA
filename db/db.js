const mongoose = require('mongoose');
const logger = require('../logging/logger');
const config = require('../config/develop');
const autoIncrement = require('mongoose-auto-increment');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');

const mongodbUri = config.url;
const options = {

    auto_reconnect: true,
    poolSize: 6,
    useMongoClient: true,
    keepAlive: true
};


const db = mongoose.connect(mongodbUri, options);

autoIncrement.initialize(db);
mongoose.Promise = global.Promise;

db.once('open', () => {
    logger.info('Connected with DB');
    logger.trace('Host:' + db.host
        + ' port: ' + db.host, ' user: '
        + db.user);
    console.log('Connected with DB');
    let gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
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

const storage = new GridFsStorage({
    url: mongodbUri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

module.exports.storage = storage;
module.exports.mongoose = mongoose;
