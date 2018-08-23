const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logger');
const uuidv1 = require('uuid/v1');
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
//                     message: 'Duplication tel_number or StationName. The Statian name is :' + userInfo.stationname
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
    let uuid = uuidv1();
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'User',
        Rcoins: 0,
        tel_number: req.body.tel_number,
        email_address: req.body.email
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
                            message: 'Duplication tel_number. The tel_number is : ' + userInfo.tel_number
                        });
                    } else {
                        return res.status(409).json({success: false, message: 'Error happen when adding to DB'});
                    }
                }
                return res.status(200).json({
                    "error_code": 0,
                    "data": {
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

exports.updateReferenceAccount = (req, res) => {

    let addObject = {}, updateQuery = {}, updateObject = {};
    const inputType = `${req.body[`inputType`]}Accounts`;
    switch (inputType) {
        case 'aliPayAccounts': {
            addObject[inputType] = {
                _id: req.body.accountId,
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }
        case 'wechatAccounts': {//TODO暂时先这样
            addObject[inputType] = {
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }

        case 'bankAccounts': {//TODO暂时先这样
            addObject[inputType] = {
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }

    }

    updateQuery[`${inputType}._id`] = req.body[`accountId`];
    updateObject[`${inputType}.$`] = addObject['aliPayAccounts'];
    userModel.findOneAndUpdate(updateQuery, {$set: updateObject}, (err) => {
        if (err) {
            return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
        } else {

            return res.status(200).json({"error_code": 0, error_massage: 'OK'});
        }
    });
};
exports.addReferenceAccount = (req, res) => {

    let addObject = {};
    const inputType = `${req.body[`inputType`]}Accounts`;

    switch (inputType) {
        case 'aliPayAccounts': {
            addObject[inputType] = {
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }
        case 'wechatAccounts': {//TODO暂时先这样
            addObject[inputType] = {
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }

        case 'bankAccounts': {//TODO暂时先这样
            addObject[inputType] = {
                accountName: req.body.accountName,
                accountTelNumber: req.body.accountTelNumber
            };
            break;
        }

    }

    userModel.update({tel_number: req.user.tel_number}, {
        $push: addObject
    }, (err) => {
        if (err) {

            return res.status(500).json({"error_code": 500, error_massage: "Bad happened!"});
        } else {

            return res.status(200).json({"error_code": 0, error_massage: "OK"});
        }
    });
};


exports.updateGeneralData = (req, res) => {


    let command = {};
    if (req.body.referrer) {
        command['referrer'] = req.body.referrer;
    }
    if (req.body.nickName) {
        command['nickName'] = req.body.nickName;
    }


    userModel.findOne({tel_number: req.user.tel_number}, {password: 0}, (err, data) => {

            if (err) {

                return res.status(500).json({"error_code": 500, error_massage: "Error when trying to update DB"});
            }

            if (data) {

                if (data.referrer && command['referrer']) {
                    return res.status(400).json({"error_code": 400, error_massage: "This user already has a referrer"});
                }
                userModel.update({tel_number: req.user.tel_number}, {$set: command}, (err) => {
                    if (err) {

                        return res.status(500).json({"error_code": 500, error_massage: "Error when trying to update DB"});
                    }
                    userModel.findOneAndUpdate({email_address: req.user.email_address}, {$inc: {numberOfReferrers: 1}}).exec().then((data) => {

                        if (!data) {
                            return res.status(406).json({"error_code": 406, error_massage: "Can not find Referrer"});
                        }

                        return res.status(200).json({"error_code": 0, error_massage: "OK"});

                    }).catch(error => {
                        console.error(`Error: ${ error }\n${ error.stack }`);

                    });

                })
            }

        }
    );
};

exports.update_password = (req, res) => {
    let hashedPassword =
        require('crypto').createHash('md5').update(req.body['newpassword'] + config.saltword).digest('hex');
    let hashedCurrentPassword = require('crypto').createHash('md5').update(req.body['currentpassword'] + config.saltword).digest('hex');
    userModel.findOne({'tel_number': req.user.tel_number}, {password: 1}, (err, data) => {
        if (err) {
            logger.error('user controller updatepassword: ' + err);
            return res.status(500).json({error_code: 500, error_massage: 'Error When Trying To Verify User'});
        }
        if (!data) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});
        if (hashedCurrentPassword !== data.password) {
            return res.status(406).json({error_code: 406, error_massage: 'Current Password Is Not Correct!'});
        }
        userModel.update({tel_number: req.user.tel_number}, {$set: {password: hashedPassword}}, (err) => {
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
                .exec((err) => {
                    if (err) {
                        return res.status(503).json({
                            error_msg: "Internal Service Error",
                            error_code: "503"
                        });
                    } else {
                        userModel.update({tel_number: req.user.tel_number}, {$set: {tel_number: tel}}, (err) => {
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

    userModel.findOne({tel_number: req.user.tel_number}, {
        _id: 0,
        password: 0,
        __v: 0

    }).select("-aliPayAccounts._id").populate({
        path: 'myBills', select: '-_id typeStr typeState dealState sendPic payFreight orderID userTelNumber' +
        ' orderAmount rate NtdAmount dealDate'
    }).exec().then((info) => {


        if (!info) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});
        return res.status(200).json({data: info, error_code: 0});
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({error_code: 500, error_massage: 'Error When Trying To Verify User'});

    });


};