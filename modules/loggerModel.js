const mongoose = require('../db/db').mongoose;
const isEmpty = require('../config/tools').isEmpty;
const loggerScheme = new mongoose.Schema(
    {
        userRole: {type: String},
        userRole: {type: String},

    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


bankAccount.virtual('webLast6Digital').get(() => {
    if (!isEmpty(this.accountCode)) {
        return this.accountCode.slice(-6);
    }
});


bankAccount.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;

    }
});

let bankAccountModel = mongoose.model('bankAccount', bankAccount);
exports.bankAccountModel = bankAccountModel;
exports.bankAccount = bankAccount;