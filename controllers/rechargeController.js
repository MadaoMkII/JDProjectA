const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
const bankAccountModel = require('../modules/bankAccount').bankAccountModel;
const manageSettingController = require('../controllers/manageSettingController');
const dgPayment = require('../controllers/dgPayment');
const tool = require('../config/tools');
const logger = require('../logging/logging').logger;
const searchModel = require('../controllers/searchModel');
const dgBillModel = require('../modules/dgBill').dgBillModel;
let getUserInfo = (req) => {
    if (!req || !req.user) {
        throw new Error(`not login`);
    }
    let userObject = {};
    console.log(req.user)
    userObject.tel_number = req.user.tel_number;
    userObject.email_address = req.user.email_address;
    userObject.realName = tool.isEmpty(req.user.realName) ? `尚未实名` : req.user.realName;
    userObject.nickName = req.user.nickName;
    //userObject.Rcoins = tool.decrypt(req.user.Rcoins);
    userObject.VIPLevel = req.user.VIPLevel;
    return userObject;
};

exports.getChargeBillDetail = async (req, res) => {
    try {
        let billResult = await chargeBillModel.findOne({billID: req.body.billID}, {
            __v: 0,
            _id: 0
        });
        if (!billResult) {
            billResult = await dgBillModel.findOne({billID: req.body.billID}, {
                __v: 0,
                _id: 0
            });

        }
        return res.status(200).send({error_code: 200, error_msg: `OK`, data: billResult});
    } catch (err) {
        logger.error(`获取订单详情`, {req: req, error: err});
        return res.status(503).send({error_code: 503, error_msg: err.message});
    }

};


let bankAccountsPair = async (req, billObject) => {
    billObject.chargeInfo = {};
    billObject.chargeInfo.chargeMethod = "bankAccount";
    let webBankArray = await bankAccountModel.find();

    if (tool.isEmpty(req.body.chargeInfo.toOurAccount)) {

        throw new Error(`chargeInfo.toOurAccount can not be empty`);
    }

    for (let bankAccount of webBankArray) {
        if (bankAccount.bankCode.toString() === req.body.chargeInfo.toOurAccount.toString()) {
            billObject.chargeInfo.toOurAccount = {
                "accountCode": bankAccount.accountCode,
                "accountName": bankAccount.accountName,
                "bankName": bankAccount.bankName,
                "bankType": bankAccount.bankType,
                "bankCode": bankAccount.bankCode
            };
        }
    }
    if (tool.isEmpty(req.body.chargeInfo.chargeFromAccount)) {

        throw new Error(`chargeInfo.chargeFromAccount can not be empty`);
    }


    for (let account of  req.user.bankAccounts) {
        if (account.last6digital.toString() === req.body.chargeInfo.chargeFromAccount.toString()) {

            billObject.chargeInfo.chargeFromAccount = {
                "bankType": account.bankType,
                "bankName": account.bankName,
                "accountName": account.accountName,
                "last6digital": account.last6digital,
                "accountTelNumber": account.accountTelNumber
            }
        }
    }
};

exports.findMyChargeBills = async (req, res) => {
    try {

        let command = {};
        command.userUUid = req.user.uuid;

        let operator = searchModel.pageModel(req);

        let billResult = await chargeBillModel.find(command, {
            __v: 0,
            _id: 0
        }, operator);
        let billCount = await chargeBillModel.countDocuments({userUUid: req.user.uuid});

        return res.status(200).send({error_code: 200, error_msg: `OK`, data: billResult, nofdata: billCount});
    } catch (err) {
        logger.error(`获取用户充值订单`, {req: req, error: err});
        return res.status(503).send({error_code: 503, error_msg: err.message});
    }

};

exports.addChargeWechatBills = async (req, res) => {
    try {
        searchModel.requestCheckBox(req, "RMBAmount", "rechargeInfo",
            "rechargeInfo.rechargeToAccount", "chargeInfo", "chargeInfo.chargeFromAccount");
        req.body.rateType = `AlipayAndWechatRate`;
        const managerConfig = await manageSettingController.findCurrentSetting();
        let billObject = new chargeBillModel();
        billObject.typeStr = '微信錢包儲值';
        billObject.billID = 'CHARWE' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();

        if (req.user.userStatus.isFirstWechatCharge === false) {
            billObject.is_firstOrder = true;
        }
        billObject.rechargeInfo.rechargeAccountType = `wechat`;

        for (let wechatAccount of req.user.wechatAccounts) {
            if (wechatAccount.wechatID === req.body.rechargeInfo.rechargeToAccount) {
                billObject.rechargeInfo.rechargeToAccount = {
                    wechatID: wechatAccount.wechatID,
                    openID: wechatAccount.openID,
                    nickname: wechatAccount.nickname,
                    profileImgUrl: wechatAccount.profileImgUrl
                }
            }

        }
        await bankAccountsPair(req, billObject);

        let [rate, feeRate, feeAmount, totalAmount] = await dgPayment.getRate(req, res);
        if (req.body.RMBAmount < managerConfig.threshold[`wechat`]) {
            return res.status(403).send({
                error_code: 403,
                error_msg: 'can not less than ' + managerConfig.threshold[`wechat`]
            });
        }
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.feeRate = feeRate;
        billObject.comment = req.body.comment;

        billObject.userInfo = getUserInfo(req);
        await billObject.save();


        logger.info("用户增加微信充值订单", {
            req: req
        });

        return res.status(200).send({error_code: 0, error_msg: 'OK', data: billObject});
    } catch (err) {

        if (err.message.toString().includes(`empty`)) {

            return res.status(409).json({error_msg: `409`, error_code: err.message});
        }
        logger.error(`用户增加微信充值订单`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: err.message});
    }

};
exports.addRcoinChargeBills = async (req, res) => {

    try {
        req.body.rateType = `RcoinRate`;
        let billObject = new chargeBillModel();
        billObject.typeStr = 'R幣儲值';
        billObject.billID = 'CHARRC' + (Math.random() * Date.now() * 10).toFixed(0);
        if (tool.isEmpty(req.body.RMBAmount)) {
            return res.status(404).send({error_code: 404, error_msg: `RMBAmount can not be null`});
        }
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();

        await bankAccountsPair(req, billObject);
        let [rate, feeRate, feeAmount, totalAmount] = await dgPayment.getRate(req, res);
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.feeRate = feeRate;
        billObject.fee = feeAmount;
        billObject.comment = req.body.comment;

        billObject.userInfo = getUserInfo(req);

        await billObject.save();
        logger.info("用户R币充值订单", {
            req: req
        });
        return res.status(200).send({error_code: 0, error_msg: `OK`, data: billObject});
    } catch (err) {

        logger.error(`用户R币充值订单`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: err.message});
    }


};

exports.addChargeAliBills = async (req, res) => {
    try {
        searchModel.requestCheckBox(req, "RMBAmount", "rechargeInfo",
            "rechargeInfo.rechargeToAccount", "chargeInfo", "chargeInfo.chargeFromAccount");
        req.body.rateType = `AlipayAndWechatRate`;
        const managerConfig = await manageSettingController.findCurrentSetting();
        let billObject = new chargeBillModel();
        billObject.typeStr = '支付寶儲值';
        billObject.billID = 'CHARAL' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();

        if (req.user.userStatus.isFirstAlipayCharge === false) {
            billObject.is_firstOrder = true;
        }
        billObject.rechargeInfo.rechargeAccountType = `alipay`;

        for (let alipayAccount of req.user.aliPayAccounts) {

            if (alipayAccount.userId.toString() === req.body.rechargeInfo.rechargeToAccount.toString()) {
                billObject.rechargeInfo.rechargeToAccount = {
                    userId: alipayAccount.userId,
                    avatar: alipayAccount.avatar,
                    nickname: alipayAccount.nickName,
                    alipayAccount: alipayAccount.alipayAccount
                }
            }
        }
        await bankAccountsPair(req, billObject);
        let [rate, feeRate, feeAmount, totalAmount] = await dgPayment.getRate(req, res);
        if (req.body.RMBAmount < managerConfig.threshold[`alipay`]) {
            return res.status(403).send({
                error_code: 403,
                error_msg: 'can not less than ' + managerConfig.threshold[`alipay`]
            });
        }
        billObject.userInfo = getUserInfo(req);
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.feeRate = feeRate;
        billObject.comment = req.body.comment;
        await billObject.save();


        logger.info("用户支付宝充值订单", {
            req: req
        });

        return res.status(200).send({error_code: 0, error_msg: 'OK', data: billObject});
    } catch (err) {

        logger.error(`用户支付宝充值订单`, {req: req, error: err.message});
        if (err.message.toString().includes(`empty`)) {

            return res.status(409).json({error_msg: `409`, error_code: err.message});
        }
        return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    }

};
exports.getUserInfo = getUserInfo;
exports.bankAccountsPair = bankAccountsPair;