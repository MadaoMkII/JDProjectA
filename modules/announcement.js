const mongoose = require('../db/db').mongoose;

const anModel = new mongoose.Schema(
    {
        model_name: String,
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


const announcement = new mongoose.Schema(
    {
        model_name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'anModel'
        },
        location: String,
        announcementID: {type: String, required: true, unique: true},
        content: {type: String, required: true},
        link: {type: String, required: true, unique: true},
        announcementTopic: String
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
mongoose.model('anModel', anModel);
let announcementModel = mongoose.model('announcement', announcement);
exports.announcementModel = announcementModel;
