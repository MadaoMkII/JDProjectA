const mongoose = require('../db/db').mongoose;


const managerConfigs = new mongoose.Schema(
    {
        RcoinRate: [{beginAmount: Number, detailRate: Number}],
        PaymentPlatformRate: [{beginAmount: Number, detailRate: Number}],
        aliPayAccounts: [String],
        threshold: {platform: Number, alipay: Number, wechat: Number},
        feeRate: Number,
        L1_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L2_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L3_Issue: [{type: mongoose.Schema.Types.Mixed}]
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

const managerConfigsModel = mongoose.model('managerConfigs', managerConfigs);
exports.managerConfigsModel = managerConfigsModel;