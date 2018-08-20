const mongoose = require('../db/db').mongoose;


const appealForm = new mongoose.Schema(
    {
        L1_Issue: {required: true, type: String},
        L2_Issue: {required: true, type: String},
        L3_Issue: {required: true, type: String},
        description: {String},
        imagesFilename: [String],
        additionalResponse: [{answer: String, supplement: String}]

    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


const appealFormModel = mongoose.model('appealForm', appealForm);
module.exports.appealFormModel = appealFormModel;