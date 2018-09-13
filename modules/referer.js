const mongoose = require('../db/db').mongoose;

const processOrder = new mongoose.Schema(
    {
        userUUID: {type: String, required: true, unique: true},
        referrer: {type: String},
        referrals: {type: String, required: true},

    }, {
        'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
    }
);
