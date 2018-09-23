const mongoose = require('../db/db').mongoose;

const bankAccount = new mongoose.Schema(
    {
        bankCode: {type: String, required: true, unique: true, sparse: true},
        bankType: {type: String, required: true, sparse: true},
        bankName: {type: String, required: true, sparse: true},
        accountName: {type: String, required: true, sparse: true},
        logoFileName: String,
        accountCode: {type: String, required: true, sparse: true},
        accountTelNumber: {type: String},
        notice_1: String,
        notice_2: String,
        last6digital: String
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


bankAccount.virtual('webLast6Digital').get(function () {
    return this.accountCode.slice(-6);
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