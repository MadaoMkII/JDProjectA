const mongoose = require('../db/db').mongoose;


const friendAccounts = new mongoose.Schema(
    {
        dateClock: Date,
        accounts: [{accountName: String, amount: Number}]
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);