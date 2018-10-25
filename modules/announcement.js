const mongoose = require('../db/db').mongoose;

const anModel = new mongoose.Schema(
    {
        name: {type: String, unique: true},
    }
);
anModel.set('toJSON', {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.uuid;
            delete ret._id;
            delete ret.id;
            delete ret.updated_at;
            delete ret.created_at;
            delete ret.__v;
        }
    }
);

const announcement = new mongoose.Schema(
    {
        model: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'announceModel'
        },
        location: String,
        announcementID: {type: String, required: true, unique: true},
        content: {type: String, required: true},
        link: {type: String},
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
let announceModel = mongoose.model('announceModel', anModel);
let announcementModel = mongoose.model('announcement', announcement);
exports.announcementModel = announcementModel;
exports.announceModel = announceModel;