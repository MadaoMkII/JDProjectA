const mongoose = require('../db/db').mongoose;

const bankAccount = new mongoose.Schema(
    {
        bankCode: {type: String, required: true, unique: true, sparse: true},
        bankType: {type: String, required: true, sparse: true},
        bankName: {type: String, required: true, sparse: true},
        accountName: {type: String, required: true, sparse: true},
        logoFileName: String,
        accountTelNumber: {type: String, required: true, sparse: true},
        notice_1: String,
        notice_2: String,
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


bankAccount.virtual('last6digital').get(function () {
    return this.accountTelNumber.slice(-6);
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