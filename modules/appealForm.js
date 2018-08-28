const mongoose = require('../db/db').mongoose;


const appealForm = new mongoose.Schema(
    {
        appealFormID: {type: String, unique: true},
        isSolved: {type: Boolean, default: false},
        L1_Issue: {required: true, type: String},
        L2_Issue: {required: true, type: String},
        L3_Issue: {required: true, type: String},
        description: {required: false, type: String},
        imagesFilename: [String],
        response: String,
        userUUID: String
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

appealForm.set('toJSON', {
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
const appealFormModel = mongoose.model('appealForm', appealForm);
module.exports.appealFormModel = appealFormModel;