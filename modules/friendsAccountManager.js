const mongoose = require('../db/db').mongoose;


const friendsAccountManager = new mongoose.Schema(
    {
        friendAccounts: [{accountName: String, amount: Number}],
        dateClock: Date,

    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);