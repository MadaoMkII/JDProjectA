const mongoose = require('../db/db').mongoose;


const aliPayAccount = new mongoose.Schema(
    {
        accountName: {type: String, required: true},
        accountTelNumber: String,
        isAuthenticated: {type: Boolean, default: false}
    }
);

const wechatAccount = new mongoose.Schema(
    {
        accountName: String,
        accountTelNumber: String

    }
);
const bankAccount = new mongoose.Schema(
    {
        accountName: {type: String, required: true},
        accountTelNumber: String
    }
);

let userAccountSchema = new mongoose.Schema({

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
    nickName: String,
    isAuthenticated: {type: Boolean, default: false},
    isCStoreOpened: {type: Boolean, default: false},
    Rcoins: {type: Number, default: 0},
    returnCoins: {type: Number, default: 0},
    growthPoints: {type: Number, default: 0},
    numberOfReferrers: {type: Number, default: 0},
    aliPayAccounts: [aliPayAccount],
    bankAccounts: [bankAccount],
    wechatAccounts: [wechatAccount],
    myBills: [{type: mongoose.Schema.Types.ObjectId, ref: 'billStatement'}],
    VIPLevel: {type: Number, default: 0},
    last_login_time: Date
}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});

// userAccountSchema.set('toJSON', {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret.__v;
//         ret.id = ret._id.toString();
//         delete ret._id;
//     },
// });
// let item = (await MyCollection.findOne({/* search */}).exec()).toJSON();
// if (item.id === 'someString') return item;
let userAccountModel = mongoose.model('userAccount', userAccountSchema);
exports.userAccountModel = userAccountModel;

