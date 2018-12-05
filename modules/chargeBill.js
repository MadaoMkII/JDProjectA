const mongoose = require('../db/db').mongoose;
const processOrder = require('../modules/processOrder').processOrder;
const chargeBillSchema = new mongoose.Schema(
    {
        userInfo: {type: mongoose.Schema.Types.Mixed},
        typeStr: {type: String},
        typeState: {type: Number, required: true, default: 2},  //1表示代付成功，0表示代付失败，2表示进行中
        dealState: {type: Number, required: true, default: 2},  //1表示交易完成，0表示交易关闭，2表示进行中，3表示原路退回
        sendPic: {type: Number, required: true, default: 0},    //1表示显示发送截图按钮，0表示不显示
        payFreight: {type: Number, required: true, default: 0}, //1表示显示补交运费按钮，0表示不显示
        billID: {
            required: true,
            type: String,
            unique: true, sparse: true,
            uppercase: true // Always convert `orderID` to lowercase
        }, //订单号
        userUUid: {type: String, require: true}, //用户userUUid
        NtdAmount: {type: Number, required: true},		//应付台币
        dealDate: {type: Date, required: true},	//完成时间
        //status: {type: Number, required: true, default: 0},
        RMBAmount: {type: Number, required: true},
        rate: {type: Number, default: 4.38},
        fee: {type: Number},
        feeRate: {type: Number},
        rechargeInfo: {
            rechargeAccountType: String,
            rechargeToAccount: {type: mongoose.Schema.Types.Object}
        },
        is_firstOrder: {type: Boolean, default: false},
        comment: String,
        chargeInfo: {
            chargeMethod: {type: String},
            chargeFromAccount: {type: mongoose.Schema.Types.Object},
            toOurAccount: {type: mongoose.Schema.Types.Object}
        },//alipay wechat Rcoin,
        processOrder: {type: processOrder}
    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);


chargeBillSchema.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.uuid;
            delete ret._id;
            delete ret.id;
            // delete re.chargeInfo.chargeFromAccount._id;
            delete ret.__v;
            if (doc.created_at && doc.updated_at) {
                ret.created_at = new Date(doc.created_at).getTime();
                ret.updated_at = new Date(doc.updated_at).getTime();
            } else {
                ret.created_at = new Date().getTime();
                ret.updated_at = new Date().getTime();
            }
            if (typeof doc.dealDate !== `undefined`) {
                ret.dealDate = doc.dealDate.getTime();
            }
        }
    }
);
//
// chargeBillSchema.set('toObject', {
//     virtuals: true,
//     transform: function (doc, ret) {
//         if (doc.typeStr === 'CZ') {
//             // delete ret.TBStuffInfo;
//         }
//         // delete ret.userID;
//         // delete ret._id;
//         // delete ret.id;
//         // ret.created_at = new Date(doc.created_at).getTime();
//         // ret.updated_at = new Date(doc.updated_at).getTime();
//         // if (doc.typeStr === 'CZ') {
//         //     delete ret.TBStuffInfo;
//     }
// });

// chargeBillSchema
//     .virtual('expireDate')
//     .get(function () {
//         return new Date((this.created_at.getTime() + 1000 * 60 * 30)).getTime();
//     });


const chargeBillModel = mongoose.model('chargeBill', chargeBillSchema);

module.exports.chargeBillModel = chargeBillModel;