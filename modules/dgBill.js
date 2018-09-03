const mongoose = require('../db/db').mongoose;
const processOrder = new mongoose.Schema(
    {

        billCustomID: {type: String, required: true },
        amount: Number,
        usedAccount: String,
        comment: String,
        chargeDate: Date,
        imageFilesNames: [{type: String}]
    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);


processOrder.set('toJSON', {
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
        }
    }
);

processOrder.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {

        // delete ret.userID;
        // delete ret._id;
        // delete ret.id;
        // ret.created_at = new Date(doc.created_at).getTime();
        // ret.updated_at = new Date(doc.updated_at).getTime();
        // if (doc.typeStr === 'CZ') {
        //     delete ret.TBStuffInfo;
    }
});
//
// processOrder.virtual('author', {
//     ref: 'Person',
//     localField: 'author_id',
//     foreignField: 'id',
//     justOne: true // for many-to-1 relationships
// });



const dgBillSchema = new mongoose.Schema(
    {
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
        rate: {type: Number, default: 4.38},
        fee: {type: Number},
        paymentInfo: {
            paymentMethod: String,//Rcoin ,alipay
            paymentDFAccount: String, //alipay only
        },
        itemInfo:
            {
                itemName: String,
                itemLink: String,
                itemPrice: Number
            },
        expireDate: Date,
        comment: String,
        processOrder: {processOrder}
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
            ret.expireDate = doc.expireDate.getTime();
        }
    }
);

dgBillSchema.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {
        // delete ret.userID;
        // delete ret._id;
        // delete ret.id;
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
const processOrderModel = mongoose.model('processOrder', processOrder);
const dgBillModel = mongoose.model('dgBill', dgBillSchema);
module.exports.dgBillModel = dgBillModel;
module.exports.processOrderModel = processOrderModel;