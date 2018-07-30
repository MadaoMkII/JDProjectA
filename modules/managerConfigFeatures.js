const mongoose = require('../db/db').mongoose;


const managerConfigs = new mongoose.Schema(
    {
        rate: Number,
        aliPayAccounts: [String]
    }, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
);


const managerConfigsModel = mongoose.model('managerConfigs', managerConfigs);


module.exports.managerConfigsModel = managerConfigsModel;