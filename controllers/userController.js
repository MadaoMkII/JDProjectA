const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const refererModel = require('../modules/userAccount').refererModel;
const logger = require('../logging/logger');
const uuidv1 = require('uuid/v1');
const redis = require("redis");
const tools = require("../config/tools");
exports.getAdmin = async (req, res) => {

    let result = require('crypto').createHash('md5').update("123456" + config.saltword).digest('hex');
    let user = await userModel.findOneAndUpdate({tel_number: req.body.tel_number}, {$set: {password: result}});

    return res.status(200).json({
        "error_code": 0,
        "data": {
            role: user,
            tel_number: req.body.tel_number
        }
    });

};

exports.zhuce = async (req, res) => {
    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let uuid = uuidv1();
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'Super_Admin',
        Rcoins: 188,
        tel_number: req.body.tel_number,
        email_address: req.body.email
    };

    let a = await new userModel(userInfo).save();

    return res.status(200).json({
        "error_code": 0,
        "data": a
    });

};
exports.setReferer = async (req, res) => {

    try {
        // if (req.user.userStatus.isRefereed) {
        //     return res.status(201).json({error_code: 201, error_massage: 'Already refereed a account'});
        // }

        let search = {};
        let email_reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        let wanwan_phone_reg = /^1(3|4|5|7|8)\d{9}$/;
        let mainland_reg = /^1[3|4|5|7|8][0-9]{9}$/;
        ///^(09)[0-9]{8}$/;
        if (!tools.isEmpty(req.body.referer)) {

            if (email_reg.test(req.body.referer)) {
                search = {email_address: req.body.referer};

            } else if (wanwan_phone_reg.test(req.body.referer) || mainland_reg.test(req.body.referer)) {
                search = {tel_number: req.body.referer};

            } else {

                return res.status(400).json({error_code: 400, error_massage: 'Wrong inputType'});
            }
        }

        if (!tools.isEmpty(req.user.referrer) && !tools.isEmpty(req.user.referrer.referralsUUID)) {

            return res.status(201).json({error_massage: 'you already has a referrer', error_code: 201});
        }

        let referrals = await userModel.findOne(search);

        if (tools.isEmpty(referrals)) {
            return res.status(400).json({error_massage: 'Can not find your referer', error_code: 400});
        }
        if (referrals.userStatus.isRefereed) {

            return res.status(201).json({error_massage: 'target user already has been referred', error_code: 201});
        }

        await userModel.update({uuid: referrals.uuid}, {
            $set: {
                "userStatus.isRefereed": true,
                "referrer.referrerUUID": req.user.uuid
            }
        }, {upsert: true});//被推荐人

        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
            $set: {
                "referrer.referralsUUID": referrals.uuid,
                "referrer.addTime": new Date().getTime()
            }, $inc: {growthPoints: 10}
        }, {new: true});//推荐人
        req.user = user;
        return res.status(200).json({error_massage: 'OK', error_code: 0, data: user});
    } catch (e) {
        if (e.toString().indexOf(`E11000`)) {
            return res.status(400).json({
                error_code: 400, error_massage: 'referrer ID is duplicate,' +
                'please recommend another user'
            });
        }
        return res.status(500).json({error_code: 500, error_massage: 'Failed to add'});
    }
};

exports.setUserRole = async (req, res) => {

    try {
        let role = ``;
        if (req.body[`roleCode`] === 1) {
            role = `Admin`;
        }
        if (req.body[`roleCode`] === 0) {
            role = `User`;
        }
        let result = await userModel.findOneAndUpdate({uuid: req.body.uuid}, {$set: {role: role}}, {new: true});
        req.user = result;
        return res.status(200).json({"error_code": 200, error_massage: "OK", data: result});
    } catch (e) {
        return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
    }

};
exports.findUserReferer = async (req, res) => {
    try {
        let operator = {};
        if (!tools.isEmpty(req.body['page']) && !tools.isEmpty(req.body['unit'])) {
            operator.skip = (req.body['page'] - 1) * req.body['unit'];
            operator.limit = parseInt(req.body['unit']);
        }//
        let billCount = await userModel.find({"referrer.referrerUUID": {$exists: true}}).count();
        let result = await userModel.find({"referrer.referrerUUID": {$exists: true}}, {
            email_address: 1,
            Rcoins: 1, realName: 1, referrer: 1
        });
        let finalResult = [];

        for (let entity of result) {

            finalResult.push({
                referrerUUID: entity.referrer.referrerUUID,
                email_address: entity.email_address,
                addTime: entity.referrer.addTime,
                realName: entity.realName
            })

        }


        return res.status(200).json({
            "error_code": 0,
            "data": finalResult,
            nofdata: billCount
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
    }

};
exports.findUser = async (req, res) => {
    try {
        let operator = {};
        if (!tools.isEmpty(req.body['page']) && !tools.isEmpty(req.body['unit'])) {
            operator.skip = (req.body['page'] - 1) * req.body['unit'];
            operator.limit = parseInt(req.body['unit']);
        }
        let billCount = await userModel.count();
        let result = await  userModel.find({}, {
            role: 1,
            tel_number: 1,
            email_address: 1,
            nickName: 1,
            realName: 1,
            bankAccounts: 1,
            growthPoints: 1,
            Rcoins: 1,
            referrer: 1
        }, operator);
        // for (let userEntity of result) {
        //
        //     if (!tools.isEmpty(userEntity.referrer)) {
        //
        //         if (userEntity.referrer.referrerUUID) {
        //             let tempInfoObject = await userModel.findOne({uuid: userEntity.referrer.referrerUUID});
        //             userEntity.referrer=tempInfoObject.realName
        //
        //
        //         }
        //         if (userEntity.referrer.referralsUUID) {
        //         }
        //     }
        //
        // }


        return res.status(200).json({
            "error_code": 0,
            "data": result,
            nofdata: billCount
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
    }

};
exports.userSignUp = (req, res) => {
    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let uuid = uuidv1();
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'User',
        Rcoins: '0',
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
                        return res.status(409).json({
                            success: false,
                            message: 'Error happen when adding to DB',
                            data: err
                        });
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

exports.getUserInfo = async (req, res) => {
    try {
        let userInfo = req.user;

        return res.status(201).json({error_code: 500, error_massage: `OK`, data: userInfo});
    } catch (e) {
        console.log(e)
        return res.status(503).json({error_code: 503, error_massage: e});
    }


    // userModel.findOne({tel_number: req.user.tel_number}, {
    //     _id: 0,
    //     password: 0,
    //     __v: 0
    //
    // }).select("-aliPayAccounts._id").populate({
    //     path: 'myBills', select: '-_id typeStr typeState dealState sendPic payFreight orderID userTelNumber' +
    //     ' orderAmount rate NtdAmount dealDate'
    // }).exec().then((info) => {
    //
    //
    //     if (!info) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});
    //     return res.status(200).json({data: info, error_code: 0});
    // }).catch((err) => {
    //     console.log(err);
    //     return res.status(500).json({error_code: 500, error_massage: 'Error When Trying To Verify User'});
    //
    // });


};
exports.addUserBank = async (req, res) => {
    try {

        let bankObject = {};
        for (let index in req.body) {

            if (!tools.isEmpty(req.body[index])) {

                bankObject[index] = req.body[index];
            }
        }
        console.log(bankObject)
        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$push: {bankAccounts: bankObject}}, {password: 0, new: true});
        res.status(200).json({error_code: 200, error_massage: 'OK', data: user});
    } catch (e) {
        console.log(e
        )
        return res.status(500).json({error_code: 500, error_massage: 'Failed to add'});
    }

};
exports.delUserBank = async (req, res) => {
    try {

        let last6digital = req.body.last6digital;

        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$pull: {bankAccounts: {last6digital: last6digital}}}, {password: 0, new: true});
        res.status(200).json({error_code: 200, error_massage: 'OK', data: user});
    } catch (e) {
        return res.status(500).json({error_code: 500, error_massage: 'Failed to del'});
    }

};


exports.addUserRealName = async (req, res) => {
    try {
        for (let index in req.body) {

            if (tools.isEmpty(req.body[index])) {
                return res.status(400).json({error_code: 400, error_massage: 'Empty input value'});
            }
        }

        if (!tools.isEmpty(req.user.realIDNumber)) {
            return res.status(400).json({error_code: 400, error_massage: 'Already have a ID Number'});
        }
        const reg = /^[a-zA-Z][0-9]{9}$/;
        let result_reg = reg.test(req.body.realIDNumber);
        if (!result_reg) {
            return res.status(400).json({error_code: 400, error_massage: 'Not a valid ID Number'});
        }

        let myEvent = {
            eventType: `growthPoint`,
            amount: 10,
            behavior: `Add RealName`
        };

        await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
            $set: {
                realName: req.body.realName,
                realIDNumber: req.body.realIDNumber
            },
            $inc: {growthPoints: 10}, $push: {whatHappenedToMe: myEvent}
        }, {new: true});

        res.status(200).json({error_code: 200, error_massage: 'OK'});

    } catch (e) {

        return res.status(400).json({error_code: 400, error_massage: 'Error happen'});
    }


};

