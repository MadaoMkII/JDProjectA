const mongoose = require('mongoose');
const config = require('../config/develop');
const autoIncrement = require('mongoose-auto-increment');

mongoose.set('useFindAndModify', false);
const mongodbUri = config.url;
const options = {
    poolSize: 6,
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true,
    dbName :`yubaopay_test`
};

const connection = mongoose.connection;
mongoose.connect(mongodbUri, options);
if (connection !== "undefined") {
    //console.log(connection.readyState.toString());
    connection.once("open", () => {

        console.log("Connection Open");
    });
} else {

    console.log('Sorry not connected');
}

let db = mongoose.connection;

db.on('error', (error) => {

    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('close', (info) => {
    console.log('Disconnected');

});
autoIncrement.initialize(mongoose.connection);
mongoose.Promise = global.Promise;
module.exports.mongoose = mongoose;
