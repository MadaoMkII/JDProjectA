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
    role: String
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

