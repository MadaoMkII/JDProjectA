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

exports.dujiuxing = async (req, res) => {
    return res.status(200).json({
        "error_code": 0,
        "data": {
            "bank": [
                {"value": "004", "label": "004 台灣銀行"},
                {"value": "005", "label": "005 土地銀行"},
                {"value": "006", "label": "006 合作金庫"},
                {"value": "007", "label": "007 第一銀行"},
                {"value": "008", "label": "008 華南銀行"},
                {"value": "009", "label": "009 彰化銀行"},
                {"value": "011", "label": "011 上海銀行"},
                {"value": "012", "label": "012 台北富邦銀行"},
                {"value": "013", "label": "013 國泰世華銀行"},
                {"value": "016", "label": "016 高雄銀行"},
                {"value": "017", "label": "017 兆豐商銀"},
                {"value": "020", "label": "020 瑞實銀行"},
                {"value": "021", "label": "021 花旗"},
                {"value": "025", "label": "025 首都銀行"}
            ],
            "postOffice": [
                {"value": "700", "label": "700 郵局"}
            ],
            "cooperative": [
                {"value": "104", "label": "104 台北五信"},
                {"value": "106", "label": "106 台北九信"}
            ],
            "association": [
                {"value": "600", "label": "600 農金資中心"},
                {"value": "603", "label": "603 基隆市農會"}
            ],
            "fishing": [
                {"value": "503", "label": "503 基隆漁會"},
                {"value": "504", "label": "504 瑞芳漁會"}
            ]
        }


    });


}
exports.zhuce = async (req, res) => {
    let result = require('crypto').createHash('md5').update(req.body.password + config.saltword).digest('hex');
    let uuid = uuidv1();
    let userInfo = {
        uuid: uuid,
        password: result,
        role: 'User',
        Rcoins: 198,
        tel_number: req.body.tel_number,
        email_address: req.body.email
    };

    let a = await new userModel(userInfo).save();

    return res.status(200).json({
        "error_code": 0,
        "data": a
    });

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

exports.setReferer = async (req, res) => {

    try {
        if (req.user.userStatus.isRefereed) {
            return res.status(201).json({error_code: 201, error_massage: 'Already refereed a account'});
        }
        let inputType = req.body[`inputType`];
        let search = {};
        switch (inputType) {
            case `tel_number`:
                search = {tel_number: req.body.referer};
                break;
            case `email_address`:
                search = {email_address: req.body.referer};
                break;

            default:
                return res.status(400).json({error_code: 400, error_massage: 'Wrong inputType'});

        }

        let referrals = await userModel.findOne(search);

        await userModel.update({uuid: referrals.uuid}, {$push: {"referrer.referrerUUID": req.user.uuid}}, {
            upsert: true
        });//被推荐人
        await userModel.update({uuid: req.user.uuid}, {$set: {"referrer.referralsUUID": referrals.uuid}}, {
            upsert: true
        });//推荐人

        let user = await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
            $set: {"userStatus.isRefereed": true},
            $inc: {growthPoints: 10}
        });

        return res.status(200).json({error_massage: 'OK', error_code: 0, data: user});
    } catch (e) {
        console.log(e)
        return res.status(500).json({error_code: 500, error_massage: 'Failed to add'});
    }
};
