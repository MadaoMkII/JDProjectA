const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const refererModel = require('../modules/userAccount').refererModel;
const searchModel = require('../controllers/searchModel');
const logger = require('../logging/logging').logger;
const uuidv1 = require('uuid/v1');
const redis = require("redis");
const tools = require("../config/tools");


exports.zhuce = async (req, res) => {
    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let uuid = uuidv1();
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'Super_Admin',
        Rcoins: 188,
        tel_number: req.body.tel_number,
        email_address: req.body.email, referrer: new refererModel()
    };

    let a = await new userModel(userInfo).save();

    return res.status(200).json({
        "error_code": 0,
        "data": a
    });

};
exports.setReferer = async (req, res) => {

    try {
        let search = {};
        let email_reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        let wanwan_phone_reg = /^((?=(09))[0-9]{10})$/;
        //let mainland_reg = /^1[3|4|5|7|8][0-9]{9}$/;
        ///^(09)[0-9]{8}$/;

        if (`` + req.user.tel_number === `` + req.body.referer) {
            return res.status(400).json({error_code: 400, error_massage: 'You can not refer yourself'});
        }
        if (!tools.isEmpty(req.body.referer)) {

            if (email_reg.test(req.body.referer)) {
                search = {email_address: req.body.referer};

            } else if (wanwan_phone_reg.test(req.body.referer)) {
                search = {tel_number: req.body.referer};

            } else {

                return res.status(404).json({error_code: 404, error_massage: 'Wrong inputType'});
            }
        } else {
            return res.status(406).json({error_code: 406, error_massage: 'referer is null'});
        }
        //
        if (req.user.userStatus.isRefereed) {

            return res.status(201).json({error_massage: 'you already has a referrer', error_code: 201});
        }

        let userA = await userModel.findOne(search);

        if (tools.isEmpty(userA)) {
            return res.status(202).json({error_massage: 'Can not find your referer', error_code: 202});
        }
        // if (referrals.userStatus.isRefereed) {
        //
        //     return res.status(208).json({error_massage: 'target user already has been referred', error_code: 208});
        // }

        let userB = await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
            $set: {
                "userStatus.isRefereed": true,
                "referrer.referrerUUID": userA.uuid,
                "referrer.referrer_tel_number": userA.tel_number,
                "referrer.referrer_email": userA.email_address,
                "referrer.addTime": new Date().getTime()
            }
        }, {upsert: true, new: true});//被推荐人 userB

        await userModel.findOneAndUpdate({uuid: userA.uuid}, {
            $push: {
                "referrer.referrals": {
                    referrals_tel_number: req.user.tel_number,
                    referrals_email: req.user.email_address,
                    addTime: new Date().getTime(),
                    referralsUUID: req.user.uuid
                }
            }
        });//推荐人 userA
        await userModel.findOneAndUpdate({uuid: userA.uuid}, {
            $pull: {"referrer.referrals": {referrals_tel_number: ""}}
        });//推荐人 userA
        logger.info("(new Error().stack).split(\"at \")[3]", {
            level: `USER`,
            user: req.user.uuid,
            action: `setReferer`,
            body: req.body
        });
        return res.status(200).json({error_massage: 'OK', error_code: 0, data: userB});
    } catch (err) {
        logger.error("Error: setReferer", {
            status: 503,
            level: `USER`,
            response: `Set Referer Failed`,
            user: req.user.uuid,
            action: `setReferer`,
            body: req.body,
            error: err
        });
        if (err.toString().indexOf(`E11000`)) {
            return res.status(400).json({
                error_code: 400, error_massage: 'referrer ID is duplicate,' +
                'please recommend another user'
            });
        }
        return res.status(503).json({error_code: 503, error_massage: 'Set Referer Failed'});
    }
};

exports.setUserRole = async (req, res) => {


    if (req.body.uuid === req.user.uuid) {
        return res.status(401).json({"error_code": 401, error_massage: "You can not set yourself role"});
    }
    let role = ``;
    if (req.body[`roleCode`] === 1) {
        role = `Admin`;
    }
    if (req.body[`roleCode`] === 0) {
        role = `User`;
    }
    try {
        let result = await userModel.findOneAndUpdate({uuid: req.body.uuid}, {$set: {role: role}}, {new: true});
        logger.info("setUserRole", {
            level: `USER`,
            user: req.user.uuid,
            action: `setUserRole`,
            body: req.body
        });
        return res.status(200).json({"error_code": 200, error_massage: "OK", data: result});
    } catch (err) {

        logger.error("Error: setUserRole", {
            status: 503,
            level: `USER`,
            response: `Set UserRole Failed`,
            user: req.user.uuid,
            action: `setUserRole`,
            body: req.body,
            error: err
        });
        return res.status(503).json({"error_code": 503, error_massage: "Set UserRole Failed`"});
    }

};

let findUserDAO = async (req, res, searchArgs, operator) => {


    return new Promise(async (resolve, reject) => {
        try {
            let result = await userModel.find(
                searchArgs.searchCondition,
                searchArgs.showCondition,
                operator);


            let count = await userModel.count(searchArgs.searchCondition);

            resolve([result, count]);
        } catch (err) {
            reject(err);
        }

    });


};

exports.findUserReferer = async (req, res) => {
    try {
        let operator = {};
        if (!tools.isEmpty(req.body['page']) && !tools.isEmpty(req.body['unit'])) {
            operator.skip = (req.body['page'] - 1) * req.body['unit'];
            operator.limit = parseInt(req.body['unit']);
        }//
        let billCount = await userModel.find({"userStatus.isRefereed": true}).count();
        let result = await userModel.find({"userStatus.isRefereed": true}, {
            email_address: 1, tel_number: 1,
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
    } catch (err) {
        logger.error(err.error_massage, {
            status: 503,
            level: `USER`,
            response: `find User Referer Failed`,
            user: req.user.uuid,
            action: `findUserReferer`,
            body: req.body,
            error: err
        });
        return res.status(503).json({"error_code": 503, error_massage: "findUserReferer failed"});
    }

};
exports.findUser = async (req, res) => {

    try {

        let command = {};
        command.showCondition = {
            role: 1,
            tel_number: 1,
            email_address: 1,
            nickName: 1,
            realName: 1,
            bankAccounts: 1,
            growthPoints: 1,
            Rcoins: 1,
            uuid: 1,
            referrer: 1
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `role`, "require": false},
            {"filedName": `tel_number`, "require": false},
            {"filedName": `email`, "require": false}
        );
        if (!tools.isEmpty(req.body.vipLevel)) {
            switch (req.body.vipLevel) {
                case `VIP0`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 22}});
                    break;
                case `VIP1`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 25, $gte: 22}});
                    break;
                case `VIP2`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 40, $gte: 25}});
                    break;
                case `VIP3`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 70, $gte: 40}});
                    break;
                case `VIP4`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 130, $gte: 70}});
                    break;
                case `VIP5`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 180, $gte: 130}});
                    break;
                case `VIP6`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 260, $gte: 180}});
                    break;
                case `VIP7`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 340, $gte: 260}});
                    break;
                case `VIP8`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 460, $gte: 340}});
                    break;
                case `VIP9`:
                    Object.assign(command.searchCondition, {growthPoints: {$lt: 560, $gte: 460}});
                    break;
                case `SVIP`:
                    Object.assign(command.searchCondition, {growthPoints: {$gte: 560}});
                    break;

            }
        }

        command.searchCondition = Object.assign(command.searchCondition, searchModel.createAndUpdateTimeSearchModel(req));
        let operator = searchModel.pageModel(req);

        let [result, count] = await findUserDAO(req, res, command, operator);

        return res.status(200).send({error_code: 200, error_msg: result, nofdata: count});

    } catch (err) {
        logger.error("Error: findUser", {
            status: 503,
            level: `USER`,
            response: `find User Failed`,
            user: req.user.uuid,
            action: `findUser`,
            body: req.body,
            error: err
        });
        return res.status(503).send({error_code: 503, error_msg: `Find User Failed`});
    }

};

exports.userSignUp = (req, res) => {
    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let uuid = uuidv1();
    let email_reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    let wanwan_phone_reg = /^((?=(09))[0-9]{10})$/;
    if (email_reg.test(req.body.email)) {
        return res.status(400).send({error_code: 400, error_msg: `wrong input email`});
    }
    if (wanwan_phone_reg.test(req.body.tel_number)) {
        return res.status(400).send({error_code: 400, error_msg: `wrong input tel_number`});
    }
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'User',
        growthPoints: 10,
        Rcoins: '0',
        tel_number: req.body.tel_number,
        email_address: req.body.email
    };

    redis.createClient().get("registerNumber:" + userInfo.tel_number, function (err, result) {

        if (result === 'OK') {
            new userModel(userInfo).save((err) => {
                if (err) {

                    logger.error("Error: userSignUp", {
                        status: 503,
                        level: `USER`,
                        response: `user Sign Up Failed`,
                        user: req.user.uuid,
                        action: `userSignUp`,
                        body: req.body,
                        error: err
                    });


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


exports.update_password = (req, res) => {//chongxie
    let hashedPassword =
        require('crypto').createHash('md5').update(req.body['newpassword'] + config.saltword).digest('hex');
    let hashedCurrentPassword = require('crypto').createHash('md5').update(req.body['currentpassword'] + config.saltword).digest('hex');
    userModel.findOne({'tel_number': req.user.tel_number}, {password: 1}, (err, data) => {
        if (err) {
            logger.error("Error: update_password", {
                status: 503,
                level: `USER`,
                response: `update password Failed`,
                user: req.user.uuid,
                action: `update_password`,
                body: req.body,
                error: err
            });

            return res.status(503).json({error_code: 503, error_massage: 'update password Failed'});
        }
        if (!data) return res.status(404).json({error_code: 404, error_massage: 'Can Not Find user'});
        if (hashedCurrentPassword !== data.password) {
            return res.status(406).json({error_code: 406, error_massage: 'Current Password Is Not Correct!'});
        }
        userModel.update({tel_number: req.user.tel_number}, {$set: {password: hashedPassword}}, (err) => {
            if (err) {
                logger.error("Error: update_password", {
                    status: 503,
                    response: `update_password Failed`,
                    user: req.user.uuid,
                    action: `update_password`,
                    body: req.body,
                    error: err
                });
                return res.status(503).json({error_code: 503, error_massage: 'update_password Failed'});
            }
            logger.info("update_password", {user: req.user.uuid, action: `update_password`, body: req.body});
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
                                logger.error("Error: updatePhoneNumber", {
                                    status: 503,
                                    level: `USER`,
                                    response: `updatePhoneNumber Failed`,
                                    user: req.user.uuid,
                                    action: `updatePhoneNumber`,
                                    body: req.body,
                                    error: err
                                });
                                return res.status(503).json({
                                    error_code: 503,
                                    error_massage: 'updatePhoneNumber Failed'
                                });
                            }
                            logger.info("updatePhoneNumber", {
                                status: 200,
                                level: `USER`,
                                user: req.user.uuid,
                                action: `updatePhoneNumber`,
                                body: req.body
                            });
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

        return res.status(200).json({error_code: 0, error_massage: `OK`, data: userInfo});
    } catch (err) {
        logger.error("Error: getUserInfo", {
            status: 503,
            level: `USER`,
            response: `getUserInfo Failed`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(503).json({error_code: 503, error_massage: `Get User Info Failed`});
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
        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$push: {bankAccounts: bankObject}}, {password: 0, new: true});
        logger.info("addUserBank", {
            level: `USER`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });

        res.status(200).json({error_code: 200, error_massage: 'OK', data: user});
    } catch (err) {
        logger.error("Error: addUserBank", {
            status: 503,
            level: `USER`,
            response: `addUserBank Failed`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).json({error_code: 500, error_massage: `Add User Bank Failed`});
    }

};
exports.delUserBank = async (req, res) => {
    try {

        let last6digital = req.body.last6digital;

        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$pull: {bankAccounts: {last6digital: last6digital}}}, {password: 0, new: true});
        logger.info("delUserBank", {
            level: `USER`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        res.status(200).json({error_code: 200, error_massage: 'OK', data: user});
    } catch (err) {
        logger.error("Error: delUserBank", {
            status: 503,
            level: `USER`,
            response: `delUserBank Failed`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).json({error_code: 500, error_massage: 'Failed to del'});
    }

};


exports.addUserRealName = async (req, res) => {
    try {

        if (!tools.isEmpty(req.user.realIDNumber)) {
            return res.status(400).json({error_code: 400, error_massage: 'Already have a ID Number'});
        }
        if (tools.isEmpty(req.body.realName)) {
            return res.status(400).json({error_code: 400, error_massage: 'realName input null value'});
        }
        if (tools.isEmpty(req.body.realIDNumber)) {
            return res.status(400).json({error_code: 400, error_massage: 'realIDNumber input null value'});
        }
        const reg = /^[a-zA-Z][0-9]{9}$/;
        let result_reg = reg.test(req.body.realIDNumber);
        if (!result_reg) {
            return res.status(400).json({error_code: 400, error_massage: 'Not a valid ID Number'});
        }

        let myEvent = {
            eventType: `growthPoint`,
            amount: tools.encrypt(10),
            behavior: `Add RealName`
        };

        await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
            $set: {
                "userStatus.isRealName": true,
                realName: req.body.realName,
                realIDNumber: req.body.realIDNumber
            },
            $inc: {growthPoints: 10}, $push: {whatHappenedToMe: myEvent}
        }, {new: true});

        logger.info("addUserRealName", {
            level: `USER`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        res.status(200).json({error_code: 200, error_massage: 'OK'});

    } catch (err) {
        logger.error("Error: addUserRealName", {
            status: 503,
            level: `USER`,
            response: `addUserRealName Failed`,
            user: req.user.uuid,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(400).json({error_code: 400, error_massage: 'Add User`s Real Name Failed'});
    }
};

