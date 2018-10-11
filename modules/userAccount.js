const mongoose = require('../db/db').mongoose;
const bankAccount = require('../modules/bankAccount').bankAccount;
const tool = require('../config/tools');

const vipCoculart = (points) => {
    let vipLevel = `VIP0`;
    let vipArray = [22, 25, 40, 70, 130, 180, 260, 340, 460, 560];
    for (let index = 0; index < vipArray.length; index++) {
        if (points >= vipArray[index]) {
            vipLevel = `VIP${index + 1}`;
            if (index === vipArray.length - 1) {
                vipLevel = `SVIP`
            }
        }
    }

    return vipLevel;
};
const referer = new mongoose.Schema(
    {
        referrerUUID: {type: String, unique: true, sparse: true},
        referralsUUID: {type: String, required: true},
        addTime: Number
    }, {_id: false}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

let refererModel = mongoose.model('referer', referer);


const myEvent = new mongoose.Schema(
    {
        eventType: {type: String, required: true},
        content: {type: String},
        amount: {type: String, required: true, set: tool.encrypt, get: tool.decrypt},
        behavior: {type: String},
        referralsUUID: {type: String}
    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);
myEvent.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;
        delete ret.password;
        ret.amount = parseInt(tool.decrypt(doc.amount));
        if (doc.created_at && doc.updated_at) {
            ret.created_at = new Date(doc.created_at).getTime();
            ret.updated_at = new Date(doc.updated_at).getTime();
        }
        if (doc.last_login_time) {
            ret.last_login_time = new Date(doc.last_login_time).getTime();
        }
    }
});

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

let userAccountSchema = new mongoose.Schema({
    uuid: {type: String},
    password: {
        required: true,
        type: String
    },
    role: String,
    userStatus: {
        hasPaid: {type: Boolean, default: false},
        isRealName: {type: Boolean, default: false},
        isAuthenticated: {type: Boolean, default: false},
        isCStoreOpened: {type: Boolean, default: false},
        isFirstTimePaid: {type: Boolean, default: false},
        isRefereed: {type: Boolean, default: false},
        isFirstAlipayCharge: {type: Boolean, default: false},
        isFirstWechatCharge: {type: Boolean, default: false}
    },
    tel_number: {
        required: true,
        type: String,
        unique: true
    },
    email_address: {
        type: String,
        unique: true
    },
    referrer: referer,
    nickName: {type: String, default: '无名氏'},
    realName: String,
    realIDNumber: String,
    publishTime: Date,
    whatHappenedToMe: [myEvent],
    Rcoins: {type: String, required: true, set: tool.encrypt, get: tool.decrypt},
    returnCoins: {type: Number, default: 0},
    growthPoints: {type: Number, default: 0},
    numberOfReferrers: {type: Number, default: 0},
    aliPayAccounts: [aliPayAccount],
    bankAccounts: [bankAccount],
    wechatAccounts: [wechatAccount],
    // myBills: [{type: mongoose.Schema.Types.ObjectId, ref: 'billStatement'}],
    last_login_time: Date
}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});

userAccountSchema.virtual('VIPLevel').get(() => {
    return vipCoculart(this.growthPoints);
});

// userAccountSchema.virtual('referer', {
//     ref: 'userAccount',
//     localField: 'author_id',
//     foreignField: 'id',
//     justOne: true // for many-to-1 relationships
// });

userAccountSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;
        delete ret.password;
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
let myEventModel = mongoose.model('myEvent', myEvent);
let userAccountModel = mongoose.model('userAccount', userAccountSchema);
exports.userAccountModel = userAccountModel;
exports.refererModel = refererModel;
exports.myEventModel = myEventModel;