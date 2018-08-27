const mongoose = require('../db/db').mongoose;


const appealForm = new mongoose.Schema(
    {
        appealFormID: {type: String, unique: true},
        isSolved: {type: Boolean, default: false},
        L1_Issue: {required: true, type: String},
        L2_Issue: {required: true, type: String},
        L3_Issue: {required: true, type: String},
        description: {String},
        imagesFilename: [String],
        response: String
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


const appealFormModel = mongoose.model('appealForm', appealForm);
module.exports.appealFormModel = appealFormModel;