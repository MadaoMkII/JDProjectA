const mongoose = require('../db/db').mongoose;


const managerConfigs = new mongoose.Schema(
    {
        RcoinRate: [{beginAmount: Number, detailRate: Number}],
        PaymentPlatformRate: [{beginAmount: Number, detailRate: Number}],
        aliPayAccounts: [String],
        threshold: {platformRcoin: Number, alipay: Number, wechat: Number},
        feeRate: Number
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

const managerConfigsModel = mongoose.model('managerConfigs', managerConfigs);
exports.managerConfigsModel = managerConfigsModel;