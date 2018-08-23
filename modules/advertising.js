const mongoose = require('../db/db').mongoose;


const advertising = new mongoose.Schema(
    {
        referer: {type: String, required: true},
        link: {type: String, required: true, unique: true},
        imageName: String
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);
let advertisingModel = mongoose.model('advertising', advertising);
exports.advertisingModel = advertisingModel;
