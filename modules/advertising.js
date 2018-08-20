const mongoose = require('../db/db').mongoose;


const advertising = new mongoose.Schema(
    {
        referer: {type: String, required: true},
        link: {type: String, required: true},
        imageName: String
    }
);
let advertisingModel = mongoose.model('advertising', advertising);
exports.advertisingModel = advertisingModel;
