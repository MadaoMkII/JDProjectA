const mongoose = require('../db/db').mongoose;

const baseRate = new mongoose.Schema({
        VIPLevel: {type: String, unique: true, sparse: true},
        detailRate: Number
    }
);
baseRate.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.id;
            delete ret.__v;
        }
    }
);
const rateInfo = new mongoose.Schema({
        beginAmount: Number,
        detailRate: Number
    }, {_id: false}
);
const rateModel = new mongoose.Schema({
        rateInfo: [rateInfo],
        vipLevel: String
    }, {_id: false}
);

const managerConfigs = new mongoose.Schema(
    {
        RcoinRate: [rateModel],
        AlipayAndWechatRate: [rateModel],
        aliPayAccounts: [String],
        threshold: {platform: Number, alipay: Number, wechat: Number},
        feeRate: Number,
        L1_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L2_Issue: [{type: mongoose.Schema.Types.Mixed}],
        L3_Issue: [{type: mongoose.Schema.Types.Mixed}],
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);
const baseRateModel = mongoose.model('baseRate', baseRate);
const managerConfigsModel = mongoose.model('managerConfigs', managerConfigs);
exports.managerConfigsModel = managerConfigsModel;
exports.baseRateModel = baseRateModel;