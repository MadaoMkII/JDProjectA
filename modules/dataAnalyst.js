const mongoose = require('../db/db').mongoose;


const dataAnalyst = new mongoose.Schema(
    {
        year: {type: String, required: true},
        month: {type: String, required: true},
        day: {type: String, required: true},
        itemWebType: {type: String, required: true},
        amount: {type: Number, default: 0},
        count: {type: Number, default: 0},
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);
dataAnalyst.set('toJSON', {
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

let dataAnalystModel = mongoose.model('dataAnalyst', dataAnalyst);
exports.dataAnalystModel = dataAnalystModel;
