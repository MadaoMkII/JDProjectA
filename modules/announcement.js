
const mongoose = require('../db/db').mongoose;

const announcement = new mongoose.Schema(
    {
        L1_category: String,
        L2_category: String,
        advertisingID: {type: String, required: true, unique: true},
        referer: {type: String, required: true},
        link: {type: String, required: true, unique: true},
        filename: String,
        topic: String
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);
announcement.set('toJSON', {
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
let advertisingModel = mongoose.model('advertising', advertising);
exports.advertisingModel = advertisingModel;
