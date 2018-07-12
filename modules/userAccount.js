const mongoose = require('../db/db').mongoose;
const logger = require('../logging/logger');

let userAccountSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        index: true,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    role: String,
    tel_number: {
        required: true,
        type: String,
        unique: true
    },
    email_address: {
        type: String,
        unique: true
    },
    referrer: String,
    last_login_time: Date
}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});


userAccountSchema.statics.addNewUserAccount = (userInfo) => {
    let userAccountEntity = new userAccountModel(userInfo);
    userAccountEntity.save((err) => {
        if (err) {
            logger.error('Error location : Class: agent, function: addAgent. ');
            logger.error(err);
            return err;
        }
    });
};


let userAccountModel = mongoose.model('userAccount', userAccountSchema);
exports.userAccountModel = userAccountModel;

