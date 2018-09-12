const mongoose = require('../db/db').mongoose;

const processOrder = new mongoose.Schema(
    {
        billID: {type:String, required: true},
        comment: String,
        chargeDate: {type: Date, required: true},
        imageFilesNames: [{type: String}],
        chargeAmount: Number,
        accountWeUsed:String,

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

// chargeBillSchema
//     .virtual('expireDate')
//     .get(function () {
//         return new Date((this.created_at.getTime() + 1000 * 60 * 30)).getTime();
//     });


const processOrderModel = mongoose.model('processOrder', processOrder);

module.exports.processOrderModel = processOrderModel;