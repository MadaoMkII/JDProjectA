const mongoose = require('../db/db').mongoose;
const bankAccount = require('../modules/bankAccount').bankAccount;
const tool = require('../config/tools');
const logger = require('../logging/logging').logger;

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
const referrals = new mongoose.Schema(
    {
        addTime: Date,
        referrals_tel_number: String,
        referrals_email: String,
        referralsUUID: String
    }, {_id: false}
);
const referer = new mongoose.Schema(
    {
        referrerUUID: {type: String, default: null},
        referrer_email: {type: String, default: null},
        referrer_tel_number: {type: String, default: null},
        referrals: {
            type: [referrals]
            //default: [{addTime: null, referrals_tel_number: "", referrals_email: "", referralsUUID: ""}]
        },
        addTime: {type: Date, default: null}
    }, {_id: false}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);
referer.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.id;
        if (doc.referrals.length === 0) {
            ret.referrals.push({addTime: null, referrals_tel_number: null, referrals_email: null, referralsUUID: null});
        }

    }
});
let refererModel = mongoose.model('referer', referer);


const myEvent = new mongoose.Schema(
    {
        eventType: {type: String, required: true},
        content: {type: String},
        pointChange: Number,
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
        if (!tool.isEmpty(doc.amount)) {
            ret.amount = parseInt(tool.decrypt(doc.amount));
        }

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
        alipayAccount: {type: String},
        userId: {type: String},
        avatar: {type: String},
        realName: {type: String},
        province: {type: String},
        city: {type: String},
        nickName: {type: String},
        isStudentCertified: {type: Boolean},
        userType: {type: String},
        userStatus: {type: String},
        isCertified: {type: Boolean},
        gender: {type: String}
    }, {_id: false}
);
const wechatAccount = new mongoose.Schema(
    {
        wechatID: {type: String, required: true},
        wechat_user_info: {type: mongoose.Schema.Types.Mixed},
        qr_info: {type: mongoose.Schema.Types.Mixed},
        openID: {type: String, required: true},
        profileImgUrl: String,
        hasRealNameAuthed: {type: Boolean, default: true},
        activeStatus: Boolean,
        nickname: String

    }, {_id: false}
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
        isFirstWechatCharge: {type: Boolean, default: false},
        isEmployee: {type: Boolean, default: false}
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
    referrer: {type: referer},
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


// userAccountSchema.virtual('referer', {
//     ref: 'userAccount',
//     localField: 'author_id',
//     foreignField: 'id',
//     justOne: true // for many-to-1 relationships
// });
userAccountSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;
        delete ret.password;
        ret.Rcoins = doc.Rcoins;
        ret.VIPLevel = vipCoculart(doc.growthPoints);
        if (doc.created_at && doc.updated_at) {
            ret.created_at = new Date(doc.created_at).getTime();
            ret.updated_at = new Date(doc.updated_at).getTime();
        }
        if (doc.last_login_time) {
            ret.last_login_time = new Date(doc.last_login_time).getTime();
        }
    }
});
userAccountSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;
        delete ret.password;
        ret.Rcoins = doc.Rcoins;
        ret.VIPLevel = vipCoculart(doc.growthPoints);
        if (doc.created_at && doc.updated_at) {
            ret.created_at = new Date(doc.created_at).getTime();
            ret.updated_at = new Date(doc.updated_at).getTime();
        }
        if (doc.last_login_time) {
            ret.last_login_time = new Date(doc.last_login_time).getTime();
        }
    }
});

userAccountSchema.virtual('VIPLevel').get(() => {
    return vipCoculart(this.growthPoints);
});

let myEventModel = mongoose.model('myEvent', myEvent);
let userAccountModel = mongoose.model('userAccount', userAccountSchema);
exports.userAccountModel = userAccountModel;
exports.refererModel = refererModel;
exports.myEventModel = myEventModel;