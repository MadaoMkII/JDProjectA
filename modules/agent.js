const mongoose = require('../db/db').mongoose;
const logger = require('../logging/logger');
let agentSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        unique: true
    },
    password: String,
    country: String,
    role: String,
    stationname: {
        required: true,
        type: String,
        index: true,
        unique: true
    },
    registerby: String,
    receiverate: {required: true, type: Number},
    publishrate: {required: true, type: Number}
}, {'timestamps': {'createdAt': 'created_at', 'updatedAt': 'updated_at'}});


agentSchema.statics.findByPositionName = (stationname, callback) => {

    agentModel.find({stationname: {$in: stationname}}, {
        _id: 0,
        receiverate: 1,
        publishrate: 1,
        stationname: 1
    }, (err, agents) => {

        if (err) {
            logger.error('Error location : Class: agent, function: addAgent. ');
            logger.error(err);

        }
        return callback(err, agents);

    })
};


agentSchema.statics.addNewAgent = (userinfo) => {
    let agentEntity = new agentModel(userinfo);
    agentEntity.save((err) => {
        if (err) {
            logger.error('Error location : Class: agent, function: addAgent. ');
            logger.error(err);
            return err;
        }
    });
};
agentSchema.statics.getAllAgent = function (callback) {
    agentModel.find({'role': {$eq: 'Agent'}}, 'username country role stationname receiverate publishrate createtimestamp',
        (err, agents) => {
            if (err) {
                logger.error('Error location : Class: agent, function: addAgent. ');
                logger.error(err);
                return err;
            }
            if (agents) return callback(null, agents);
            return callback(err, {'Massage': 'Can not find anything'});
        })
};

agentSchema.statics.isDuplicationName = function (data, callback) {
    agentModel.find({$or: [{'username': data.username, 'stationname': data.stationname}]}, (err, agents) => {
        if (err) {
            logger.error('Error location : Class: agent, function: addAgent. ');
            logger.error(err);
            return err;
        }
        if (agents) {
            return callback(null, agents);
        }
        return callback(err, false);
    })
};

let agentModel = mongoose.model('Agent', agentSchema);
exports.agentModel = agentModel;

