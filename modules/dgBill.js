const mongoose = require('../db/db').mongoose;
const processOrder = require('../modules/processOrder').processOrder;

const replacePostagePayment = new mongoose.Schema(
    {
        ourAccount: String,
        userPaymentAccount: {type: String}
    }, {_id: false}
);

const replacePostageBill = new mongoose.Schema(
    {
        status: {type: Number, default: 0},
        comment: String,
        replaceTime: Date,
        postageAmount: {type: Number, required: true},
        replacePostagePayment: {type: replacePostagePayment}
    }, {_id: false, 'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

replacePostageBill.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.uuid;
            delete ret._id;
            delete ret.id;
            delete ret.__v;
            if (doc.replaceTime) {
                ret.replaceTime = new Date(doc.replaceTime).getTime();
            }
        }
    }
);

const dgBillSchema = new mongoose.Schema(
    {
        isVirtualItem: {type: Boolean, default: false},
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
        RMBAmount: {type: Number, required: true},
        rate: {type: Number},
        fee: {type: Number},
        chargeInfo: {
            chargeMethod: String,
            chargeAccount: {type: mongoose.Schema.Types.Mixed},
            toOurAccount: {type: mongoose.Schema.Types.Mixed}
        },
        paymentInfo: {
            paymentMethod: String,//Rcoin ,alipay
            paymentDFAccount: {type: mongoose.Schema.Types.Mixed}, //alipay only
            friendAlipayAccount: {type: mongoose.Schema.Types.Mixed}
        },
        itemInfo:
            {
                itemWebType: String,
                itemName: String,
                itemLink: String
            },
        comment: String,
        is_firstOrder: {type: Boolean, default: false},
        userInfo: {type: mongoose.Schema.Types.Object},
        processOrder: {type: processOrder},
        replacePostage: {type: replacePostageBill}

    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});


dgBillSchema.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.uuid;
            delete ret._id;
            delete ret.id;
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

dgBillSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        // delete ret.userID;
        // delete ret._id;
        // delete ret.id;
        // doc.rate = ret.rate / 100;
        // doc.fee = ret.fee / 100;
        // ret.created_at = new Date(doc.created_at).getTime();
        // ret.updated_at = new Date(doc.updated_at).getTime();
        // if (doc.typeStr === 'CZ') {
        //     delete ret.TBStuffInfo;
    }
});

// chargeBillSchema
//     .virtual('expireDate')
//     .get(function () {
//         return new Date((this.created_at.getTime() + 1000 * 60 * 30)).getTime();
//     });

const dgBillModel = mongoose.model('dgBill', dgBillSchema);
const replacePostageBillModel = mongoose.model('replacePostageBill', replacePostageBill);
module.exports.dgBillModel = dgBillModel;
module.exports.replacePostageBillModel = replacePostageBillModel;