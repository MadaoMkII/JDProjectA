const mongoose = require('../db/db').mongoose;


const rateModel = new mongoose.Schema({
        rateInfo: [{beginAmount: Number, detailRate: Number}],
        vipLevel: String
    }, {_id: false}
);

const managerConfigs = new mongoose.Schema(
    {
        RcoinRate: [rateModel],
        PaymentPlatformRate: [rateModel],
        aliPayAccounts: [String],
        threshold: {platform: Number, alipay: Number, wechat: Number},
        feeRate: Number,
        L1_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L2_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L3_Issue: [{type: mongoose.Schema.Types.Mixed}],
        models: [String]
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

const managerConfigsModel = mongoose.model('managerConfigs', managerConfigs);
exports.managerConfigsModel = managerConfigsModel;