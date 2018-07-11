const config = require('../config/develop');
const agentModel = require('../modules/agent').agentModel;
const userModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logger');
const redis = require("redis"),
    redisClient = redis.createClient();
// exports.addAdmin = (req, res) => {
//
//     let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
//     let userInfo = {
//         username: req.body.username,
//         password: result,
//         country: req.user.country,
//         role: 'Admin'
//     };
//     new agentModel(userInfo).save((err) => {
//         if (err) {
//             logger.info(req.body);
//             logger.error('Error location : Class: userController, function: addAgent. ' + err);
//             logger.error('Response code:503, message: Error Happened , please check input data');
//
//             if (err.toString().includes('duplicate')) {
//                 return res.status(406).json({
//                     success: false,
//                     message: 'Duplication Username or StationName. The Statian name is :' + userInfo.stationname
//                 });
//             } else {
//                 return res.status(409).json({success: false, message: 'Error happen when adding to DB'});
//             }
//         }
//         return res.status(200).json(userInfo);
//     });
// };

exports.userSignUp = (req, res) => {

    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let userInfo = {
        username: req.body.username,
        password: result,
        role: 'User',
        tel_number: req.body.tel_number,
    };
    redisClient.exists("registerNumber:" + userInfo.tel_number, function (err, result) {
        if (result !== 1) {
            return res.json({"error_code": 0, error_massage: "没电话认证呢"});
        } else {
            new userModel(userInfo).save((err) => {
                if (err) {
                    logger.info(req.body);
                    logger.error('Error location : Class: userController, function: addAgent. ' + err);
                    logger.error('Response code:503, message: Error Happened , please check input data');

                    if (err.toString().includes('duplicate')) {


                        return res.status(406).json({
                            success: false,
                            message: 'Duplication Username or Tel. The Username‘s name : ' + userInfo.username
                        });
                    } else {
                        return res.status(409).json({success: false, message: 'Error happen when adding to DB'});
                    }
                }
                return res.status(200).json({
                    "error_code": 0,
                    "data": {
                        username: userInfo.username,
                        role: userInfo.role,
                        tel_number: req.body.tel_number
                    }
                });
            });
        }
    })

};
exports.addAgent = (req, res) => {

    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let userInfo = {
        username: req.body.username,
        password: result,
        country: req.user.country,
        role: 'Agent',
        registerby: req.user.stationname,
        stationname: req.body.stationname,
        receiverate: req.body.receiverate,
        publishrate: req.body.publishrate
    };
    new agentModel(userInfo).save((err) => {
        if (err) {
            logger.info(req.body);
            logger.error('Error location : Class: userController, function: addAgent. ' + err);
            logger.error('Response code:503, message: Error Happened , please check input data');

            if (err.toString().includes('duplicate')) {
                return res.status(406).json({
                    success: false,
                    message: 'Duplication Username or StationName. The Statian‘s name :' + userInfo.stationname
                });
            } else {
                return res.status(409).json({success: false, message: 'Error happen when adding to DB'});
            }
        }
        return res.status(200).json(userInfo);
    });
};

exports.getMyRegisterAgents = (req, res) => {

    agentModel.find({registerby: req.user.stationname}, {password: 0}, (err, agents) => {

        if (err) {
            return res.status(404).json({'succeed': false, 'massage': 'Can not find anything'});
        }
        return res.status(200).json(agents);
    })
};

exports.getArea = (req, res) => {

    agentModel.find({country: req.params.country}, {password: 0}, (err, agents) => {
        if (err) {
            return res.status(404).json({'succeed': false, 'massage': 'Can not find anything'});
        }
        return res.status(200).json(agents);
    })
};

exports.getAllStationsName = (req, res) => {
    agentModel.find({}, {stationname: 1}, (err, agents) => {
        if (err) {
            logger.error('Error Location: Class : userController, function : getAllStationsName. ' + err);

            return res.status(404).json({'succeed': false, 'massage': 'Can not find anything'});
        }
        return res.status(200).json(agents);
    })
};

exports.updatepassword = (req, res) => {
    let hashedPassword =
        require('crypto').createHash('md5').update(req.body['newpassword'] + config.saltword).digest('hex');
    let hashedCurrentPassword = require('crypto').createHash('md5').update(req.body['currentpassword'] + config.saltword).digest('hex');
    agentModel.findOne({'username': req.user.username}, {password: 1}, (err, data) => {
        if (err) {
            logger.error('user controller updatepassword: ' + err);
            return res.status(404).json({succeed: false, message: 'Error When Trying To Verify User'});
        }
        if (!data) return res.status(404).json({succeed: false, message: 'Can Not Find user'});
        if (hashedCurrentPassword !== data.password) {
            return res.status(404).json({succeed: false, message: 'Current Password Is Not Correct!'});
        }
        agentModel.update({username: req.user.username}, {$set: {password: hashedPassword}}, (err) => {
            if (err) {
                return res.status(404).json({succeed: false, message: 'Can not find anything'});
            }
            req.logOut();
            return res.status(200).json({succeed: true, message: 'Please relogin'});
        })
    });

};
exports.addSuperAdmin = (req, res) => {

    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let userInfo = {
        username: req.body.username,
        password: result,
        country: 'All',
        role: 'Super_Admin',
        stationname: req.body.stationname,
        receiverate: 1.0,
        publishrate: 1.0
    };
    new agentModel(userInfo).save((err) => {
        if (err) {
            logger.info(req.body);
            logger.error('Error location : Class: userController, function: addAgent. ' + err);
            logger.error('Response code:503, message: Error Happened , please check input data');

            if (err.toString().includes('duplicate')) {
                return res.status(406).json({
                    success: false,
                    message: 'Duplication Username or StationName. The station name is :' + userInfo.stationname
                });
            } else {
                return res.status(409).json({success: false, message: 'Error happen when adding to DB'});
            }
        }
        return res.status(200).json(userInfo);
    });
};