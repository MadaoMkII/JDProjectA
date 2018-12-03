const mongoose = require('../db/db').mongoose;
const loggerModelSchema = new mongoose.Schema(
    {
        info:String,
        level: {type: String},
        functionName: {type: String},
        filePath: {type: String},
        lineNumber: {type: String},
        API_response: {type: String},
        userInfo: {email_address: String, tel_number: String, uuid: String},
        requestBody: {type: mongoose.Schema.Types.Mixed},
        error: {type: mongoose.Schema.Types.Mixed}
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);

loggerModelSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret._id;
        delete ret.id;

    }
});

let loggerModel = mongoose.model('loggerModel', loggerModelSchema);
exports.loggerModel = loggerModel;