const mongoose = require('../db/db').mongoose;
const tool = require('../config/tools');
const vipCoculart = (points) => {
    let vipLevel = `VIP0`;
    let vipArray = [22, 25, 40, 70, 130, 180, 260, 340, 460, 560];
    for (let index = 0; index < vipArray.length; index++) {
        if (points >= vipArray[index]) {
            vipLevel = `VIP${index + 1}`;
            if (index === vipArray.length-1) {
                vipLevel = `SVIP`
            }
        }
    }

    return vipLevel;
};

const aliPayAccount = new mongoose.Schema(
    {
        realName: {type: String, required: true},
        accountName: {type: String, required: true},
        accountTelNumber: String,
        isAuthenticated: {type: Boolean, default: false}
    }
);
const wechatAccount = new mongoose.Schema(
    {
        realName: {type: String, required: true},
        accountName: {type: String, required: true},
        accountTelNumber: String

    }
);
const bankAccount = new mongoose.Schema(
    {
        realName: {type: String, required: true},
        accountName: {type: String, required: true},
        accountTelNumber: String
    }
);

let userAccountSchema = new mongoose.Schema({
    uuid: {type: String},
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
    nickName: {type: String, default: '无名氏'},
    isAuthenticated: {type: Boolean, default: false},
    isCStoreOpened: {type: Boolean, default: false},
    Rcoins: {type: String, required: true, set: tool.encrypt, get: tool.decrypt},
    returnCoins: {type: Number, default: 0},
    growthPoints: {type: Number, default: 460},
    numberOfReferrers: {type: Number, default: 0},
    aliPayAccounts: [aliPayAccount],
    bankAccounts: [bankAccount],
    wechatAccounts: [wechatAccount],
    // myBills: [{type: mongoose.Schema.Types.ObjectId, ref: 'billStatement'}],
    last_login_time: Date
}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});

userAccountSchema.virtual('VIPLevel').get(function () {
    return vipCoculart(this.growthPoints);
});


userAccountSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;
        delete ret.password;
        delete ret.myBills;
        ret.Rcoins = doc.Rcoins;
        if (doc.created_at && doc.updated_at) {
            ret.created_at = new Date(doc.created_at).getTime();
            ret.updated_at = new Date(doc.updated_at).getTime();
        }
        if (doc.last_login_time) {
            ret.last_login_time = new Date(doc.last_login_time).getTime();
        }
    }
});


userAccountSchema.set('toObject', {
    virtuals: true
    // transform: function (doc, ret) {
    //     ret.Rcoins = tool.decrypt(doc.Rcoins);
    // }
});

let userAccountModel = mongoose.model('userAccount', userAccountSchema);
exports.userAccountModel = userAccountModel;

