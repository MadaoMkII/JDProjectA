const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logger');
const redis = require("redis");

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
        email_address: 'none'
    };

    redis.createClient().get("registerNumber:" + userInfo.tel_number, function (err, result) {

        if (result === 'OK') {
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
        } else {
            return res.status(403).json({"error_code": 403, error_massage: "Not yet verified"});
        }
    })

};
exports.add_referrer = (req, res) => {

    userModel.findOne({username: req.user.username}, {password: 0}, (err, data) => {

        if (err) {
            return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
        }

        if (data) {

            if (data.referrer) {
                return res.status(400).json({"error_code": 400, error_massage: "Already has a referrer"});
            }
            userModel.update({username: req.user.username}, {$set: {referrer: req.body.referrer}}, (err) => {
                if (err) {
                    return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
                }

                return res.status(200).json({"error_code": 0, error_massage: "OK"});
            });

        }

    });
};

exports.update_password = (req, res) => {
    let hashedPassword =
        require('crypto').createHash('md5').update(req.body['newpassword'] + config.saltword).digest('hex');
    let hashedCurrentPassword = require('crypto').createHash('md5').update(req.body['currentpassword'] + config.saltword).digest('hex');
    userModel.findOne({'username': req.user.username}, {password: 1}, (err, data) => {
        if (err) {
            logger.error('user controller updatepassword: ' + err);
            return res.status(500).json({error_code: 500, error_massage: 'Error When Trying To Verify User'});
        }
        if (!data) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});
        if (hashedCurrentPassword !== data.password) {
            return res.status(406).json({error_code: 406, error_massage: 'Current Password Is Not Correct!'});
        }
        userModel.update({username: req.user.username}, {$set: {password: hashedPassword}}, (err) => {
            if (err) {
                return res.status(404).json({error_code: 404, error_massage: 'Can not find anything'});
            }
            req.logOut();
            return res.status(200).json({error_code: 200, error_massage: 'Please re-login'});
        });
    });

};

exports.updatePhoneNumber = (req, res) => {
    let code = req.body.code;
    let tel = req.body.tel;
    redis.createClient().get("registerNumber:" + tel, (err, result) => {

        if (err) return res.status(500).json({error_msg: "Internal Server Error", error_code: "500"});
        //服务器不存在校验码或已被删除
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }

        if (parseInt(code) === parseInt(result)) {

            let multi = redis.createClient().multi();
            //限制访问频率60秒
            multi.set('registerNumber:' + tel, "OK", 'EX', 3600)
                .exec(function (err) {
                    if (err) {
                        return res.status(503).json({
                            error_msg: "Internal Service Error",
                            error_code: "503"
                        });
                    } else {
                        userModel.update({username: req.user.username}, {$set: {tel_number: tel}}, (err) => {
                            if (err) {
                                return res.status(404).json({error_code: 404, error_massage: 'Can not find anything'});
                            }
                            req.logOut();
                            return res.status(200).json({error_code: 0, error_massage: 'Please relogin'});
                        });
                    }
                });

        } else {
            return res.status(404).json({error_msg: "No verification code found", error_code: "404"});
        }
    });
};

exports.getUserInfo = (req, res) => {

    userModel.findOne({username: req.user.username}, {
        username: 1,
        role: 1,
        tel_number: 1,
        email_address: 1,
        referrer: 1,
        _id: 0
    }, (err, info) => {

        if (err) {

            return res.status(500).json({error_code: 500, error_massage: 'Error When Trying To Verify User'});
        }
        if (!info) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});

        return res.status(200).json({data: info, error_code: 0});
    });


};