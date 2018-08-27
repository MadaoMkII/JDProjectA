const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
const logger = require('../logging/logger');
const dgBillModel = require('../modules/dgBill').dgBillModel;
const manageSettingController = require('../controllers/manageSettingController');

exports.addItemBills = async (req, res) => {
    const managerConfig = await manageSettingController.findCurrentSetting();
    let billObject = new dgBillModel();
    billObject.typeStr = '商品代购';
    billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
    billObject.RMBAmount = req.body.RMBAmount;
    //billObject.userUUid = req.user.uuid;
    billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();


    let rate;
    if (billObject.rechargeInfo.rechargeAccountType === "wechat" ||
        billObject.rechargeInfo.rechargeAccountType === "alipay") {
        for (let i = managerConfig.PaymentPlatformRate.length - 1; i >= 0; i--) {
            if (billObject.RMBAmount >= managerConfig.PaymentPlatformRate[i].beginAmount) {
                rate = managerConfig.PaymentPlatformRate[i].detailRate;
            } else {
                rate = managerConfig.PaymentPlatformRate[0].detailRate;
            }
        }
    } else {
        return res.status(403).send({error_code: 403, error_msg: 'Error input'});
    }
    if (req.body.RMBAmount < managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]) {
        return res.status(403).send({
            error_code: 403,
            error_msg: 'can not less than ' + managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]
        });
    }
    billObject.NtdAmount = req.body.RMBAmount * rate;
    billObject.rate = rate;
    billObject.fee = managerConfig.feeRate * req.body.RMBAmount * rate;
    billObject.comment = req.body.comment;
    console.log(billObject);
    // billObject.save((err) => {
    //
    //         if (err) {
    //             console.log(err)
    //             logger.info(req.body);
    //             logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
    //             logger.error('Response code:406, message: Not Succeeded Saved');
    //             return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    //         } else {
    //             return res.status(200).send({error_code: 0, error_msg: 'OK'});
    //         }
    //     }
    //);
    return res.status(200).send({error_code: 0, error_msg: billObject});
};


exports.addRcoinChargeBills = async (req, res) => {
    const managerConfig = await manageSettingController.findCurrentSetting();
    let billObject = new chargeBillModel();
    billObject.typeStr = 'R币充值';
    billObject.billID = 'CHAR' + (Math.random() * Date.now() * 10).toFixed(0);
    billObject.RMBAmount = req.body.RMBAmount;
    //billObject.userUUid = req.user.uuid;
    billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
    billObject.rechargeInfo.rechargeAccountType = req.body.rechargeInfo.rechargeAccountType;
    //billObject.rechargeInfo.rechargeToAccount = req.body.rechargeInfo.rechargeToAccount;
    billObject.chargeInfo.chargeFromAccount = req.body.chargeInfo.chargeFromAccount;
    billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;

    let rate;
    if (billObject.rechargeInfo.rechargeAccountType === "Rcoin") {
        for (let i = managerConfig.RcoinRate.length - 1; i >= 0; i--) {
            if (billObject.RMBAmount >= managerConfig.RcoinRate[i].beginAmount) {
                rate = managerConfig.RcoinRate[i].detailRate;
            } else {
                rate = managerConfig.RcoinRate[0].detailRate;
            }
        }
    } else {
        return res.status(403).send({error_code: 403, error_msg: 'Error input'});
    }
    billObject.NtdAmount = req.body.RMBAmount * rate;
    billObject.rate = rate;
    billObject.fee = managerConfig.feeRate * req.body.RMBAmount * rate;
    billObject.comment = req.body.comment;
    console.log(billObject);
    // billObject.save((err) => {
    //
    //         if (err) {
    //             console.log(err)
    //             logger.info(req.body);
    //             logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
    //             logger.error('Response code:406, message: Not Succeeded Saved');
    //             return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    //         } else {
    //             return res.status(200).send({error_code: 0, error_msg: 'OK'});
    //         }
    //     }
    //);
    return res.status(200).send({error_code: 0, error_msg: billObject});
};

exports.addChargeBills = async (req, res) => {
    const managerConfig = await manageSettingController.findCurrentSetting();
    let billObject = new chargeBillModel();
    billObject.typeStr = '账户代充';
    billObject.billID = 'CHAR' + (Math.random() * Date.now() * 10).toFixed(0);
    billObject.RMBAmount = req.body.RMBAmount;
    //billObject.userUUid = req.user.uuid;
    billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
    billObject.rechargeInfo.rechargeAccountType = req.body.rechargeInfo.rechargeAccountType;
    billObject.rechargeInfo.rechargeToAccount = req.body.rechargeInfo.rechargeToAccount;
    billObject.chargeInfo.chargeFromAccount = req.body.chargeInfo.chargeFromAccount;
    billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;

    let rate;
    if (billObject.rechargeInfo.rechargeAccountType === "wechat" ||
        billObject.rechargeInfo.rechargeAccountType === "alipay") {
        for (let i = managerConfig.PaymentPlatformRate.length - 1; i >= 0; i--) {
            if (billObject.RMBAmount >= managerConfig.PaymentPlatformRate[i].beginAmount) {
                rate = managerConfig.PaymentPlatformRate[i].detailRate;
            } else {
                rate = managerConfig.PaymentPlatformRate[0].detailRate;
            }
        }
    } else {
        return res.status(403).send({error_code: 403, error_msg: 'Error input'});
    }
    if (req.body.RMBAmount < managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]) {
        return res.status(403).send({
            error_code: 403,
            error_msg: 'can not less than ' + managerConfig.threshold[billObject.rechargeInfo.rechargeAccountType]
        });
    }
    billObject.NtdAmount = req.body.RMBAmount * rate;
    billObject.rate = rate;
    billObject.fee = managerConfig.feeRate * req.body.RMBAmount * rate;
    billObject.comment = req.body.comment;
    console.log(billObject);
    // billObject.save((err) => {
    //
    //         if (err) {
    //             console.log(err)
    //             logger.info(req.body);
    //             logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
    //             logger.error('Response code:406, message: Not Succeeded Saved');
    //             return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    //         } else {
    //             return res.status(200).send({error_code: 0, error_msg: 'OK'});
    //         }
    //     }
    //);
    return res.status(200).send({error_code: 0, error_msg: billObject});
};