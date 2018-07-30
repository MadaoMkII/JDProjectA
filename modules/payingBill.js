const mongoose = require('../db/db').mongoose;


const payingBillSchema = new mongoose.Schema(
    {
        typeStr: {type: String, default: '代付'},
        typeState: {type: Number, required: true, default: 3},  //1表示代付成功，0表示代付失败，2表示链接无效
        dealState: {type: Number, required: true, default: 3},  //1表示交易完成，0表示交易关闭，2表示原路退回
        sendPic: {type: Number, required: true, default: 0},    //1表示显示发送截图按钮，0表示不显示
        payFreight: {type: Number, required: true, default: 0}, //1表示显示补交运费按钮，0表示不显示
        billID: {
            required: true,
            type: String,
            unique: true, sparse: true,
            uppercase: true // Always convert `orderID` to lowercase
        }, //订单号
        userID: {type: String, require: true}, //用户ID
        NtdAmount: {type: Number, required: true},		//应付台币
        dealDate: {type: Date, required: true},	//完成时间
        status: {type: Number, required: true, default: 0},
        RMBAmount: {type: Number, required: true},
        rate: {type: Number, default: 4.38},
        fee: {type: Number},
        CZPayment: {
            CZAccountType: String,
            CZAccount: {type: mongoose.Schema.Types.Object},
            payToAccount: {type: mongoose.Schema.Types.Object}
        },
        TBStuffInfo: {
            friendAccount: [String],
            stuffPrice: Number,
            stuffName: String,
            staffUrl: {type: String}//商品链接},
        },
        comment: String,
        paymentMethod: {type: String, require: true}
    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);
payingBillSchema.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.userID;
            delete ret._id;
            delete ret.id;
            delete ret.__v;
            console.log(doc)
            if (doc.created_at && doc.updated_at) {
                ret.created_at = new Date(doc.created_at).getTime();
                ret.updated_at = new Date(doc.updated_at).getTime();
            } else {
                ret.created_at = new Date().getTime();
                ret.updated_at = new Date().getTime();

            }
            ret.dealDate = doc.dealDate.getTime();

        }
    }
);

payingBillSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        if (doc.typeStr === 'CZ') {
            delete ret.TBStuffInfo;
        }
        // delete ret.userID;
        // delete ret._id;
        // delete ret.id;
        // ret.created_at = new Date(doc.created_at).getTime();
        // ret.updated_at = new Date(doc.updated_at).getTime();
        // if (doc.typeStr === 'CZ') {
        //     delete ret.TBStuffInfo;
    }
});

payingBillSchema
    .virtual('expireDate')
    .get(function () {
        return new Date((this.dealDate.getTime() + 1000 * 60 * 30)).getTime();
    });


const payingBillModel = mongoose.model('payingBill', payingBillSchema);

module.exports.payingBillModel = payingBillModel;