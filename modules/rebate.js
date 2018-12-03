const mongoose = require('../db/db').mongoose;
const rebate = new mongoose.Schema(
    {
        status: String,
        billID: {type: String},
        tel_number: String,
        email_address: String,
        item_info: {type: mongoose.Schema.Types.Mixed},
        dealDate: Date

    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);
const rebateModel = mongoose.model('rebate', rebate);
module.exports.rebateModel = rebateModel;