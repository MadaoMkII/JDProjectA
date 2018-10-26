const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
const manageSettingController = require('../controllers/manageSettingController');
const dgPayment = require('../controllers/dgPayment');
const tool = require('../config/tools');
const logger = require('../logging/logging').logger;
const searchModel = require('../controllers/searchModel');

exports.findMyChargeBills = async (req, res) => {
    try {

        let command = {};
        command.userUUid = req.user.uuid;
        if (req.body['beginData'] && req.body['endData']) {
            command['created_at'] = {
                $gte: new Date(req.query['beginData']),
                $lte: new Date(req.query['endData'])
            };
        }


        let operator = searchModel.pageModel(req);

        let billResult = await chargeBillModel.find(command, {
            __v: 0,
            _id: 0
        }, operator);
        let billCount = await chargeBillModel.count({userUUid: req.user.uuid});

        return res.status(200).send({error_code: 200, error_msg: billResult, nofdata: billCount});
    } catch (err) {
        logger.error("findMyChargeBills", {
            level: req.user.role,
            response: `findMyChargeBills Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });

        return res.status(503).send({error_code: 503, error_msg: `Search Failed`});
    }

};


exports.addRcoinChargeBills = async (req, res) => {


    try {
        req.body.rateType = `RcoinRate`;
        let billObject = new chargeBillModel();
        billObject.typeStr = 'R币充值';
        billObject.billID = 'CHAR' + (Math.random() * Date.now() * 10).toFixed(0);
        if (tool.isEmpty(req.body.RMBAmount)) {
            return res.status(404).send({error_code: 404, error_msg: `RMBAmount can not be null`});
        }
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;

        // for (let account of  req.user.bankAccounts) {
        //
        //     if (account.last6digital === req.body.chargeInfo.chargeFromAccount) {
        //         account.updated_at = undefined;
        //         account.created_at = undefined;
        //         billObject.chargeInfo.chargeFromAccount = account;
        //     }
        // }

        let [rate, feeRate, feeAmount, totalAmount] = await dgPayment.getRate(req, res);
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.feeRate = feeRate;
        billObject.fee = feeAmount;
        billObject.comment = req.body.comment;
        billObject.save();
        logger.info("addRcoinChargeBills", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).send({error_code: 0, error_msg: billObject});
    } catch (err) {
        logger.error("addRcoinChargeBills", {
            level: req.user.role,
            response: `addRcoinChargeBills Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(503).send({error_code: 503, error_msg: 'Add ChargeBill Failed'});
    }


};

exports.addChargeBills = async (req, res) => {


    try {
        req.body.rateType = `AlipayAndWechatRate`;
        const managerConfig = await manageSettingController.findCurrentSetting();
        let billObject = new chargeBillModel();
        billObject.typeStr = '账户代充';
        billObject.billID = 'CHAR' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();

        if (req.user.userStatus.isFirstAlipayCharge === false &&
            req.body.rechargeInfo.rechargeAccountType === "Alipay") {
            billObject.is_firstOrder = true;
        }
        if (req.user.userStatus.isFirstWechatCharge === false &&
            req.body.rechargeInfo.rechargeAccountType === "Wechat") {
            billObject.is_firstOrder = true;
        }
        billObject.rechargeInfo.rechargeAccountType = req.body.rechargeInfo.rechargeAccountType;
        billObject.rechargeInfo.rechargeToAccount = req.body.rechargeInfo.rechargeToAccount;

        billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;
        if (billObject.chargeInfo.chargeMethod === "bankAccount") {
            for (let account of  req.user.bankAccounts) {

                if (account.last6digital === req.body.chargeInfo.chargeFromAccount) {
                    account.updated_at = undefined;
                    account.created_at = undefined;
                    billObject.chargeInfo.chargeFromAccount = account;
                }
            }
        } else {
            billObject.chargeInfo.chargeFromAccount = req.body.chargeInfo.chargeFromAccount;
        }

        let [rate, feeRate, feeAmount, totalAmount] = await dgPayment.getRate(req, res);
        if (req.body.RMBAmount < managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]) {
            return res.status(403).send({
                error_code: 403,
                error_msg: 'can not less than ' + managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]
            });
        }
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.feeRate = feeRate;
        billObject.comment = req.body.comment;
        billObject.save();


        logger.info("addChargeBills", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });


        return res.status(200).send({error_code: 0, error_msg: 'OK', data: billObject});
    } catch (err) {

        logger.error("addChargeBills", {
            level: req.user.role,
            response: `addChargeBills Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error_massage: err
        });
        return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    }

};