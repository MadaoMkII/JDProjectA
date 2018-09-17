const dgBillModel = require('../modules/dgBill').dgBillModel;
const replacePostageBillModel = require('../modules/dgBill').replacePostageBillModel;
//const logger = require('../logging/logger');
const userModel = require('../modules/userAccount').userAccountModel;
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');


let getRate = (req, res) => {


    return new Promise(async (resolve, reject) => {
        try {
            const managerConfig = await manageSettingController.findCurrentSetting();

            let rateObject = {};

            let rateType = req.body[`rateType`];
            if (rateType !== `RcoinRate` && rateType !== `AlipayAndWechatRate`) {
                return res.status(403).send({error_code: 403, error_msg: `rateType wrong input`});
            }
            for (let rateInfoEntity of managerConfig[rateType]) {

                if (rateInfoEntity.vipLevel === req.user[`VIPLevel`]) {
                    rateObject = rateInfoEntity;
                }
            }
            let rate;

            for (let rateEntity of  rateObject.rateInfo) {
                if (req.body.RMBAmount >= rateEntity.beginAmount) {
                    rate = rateEntity.detailRate;
                }
            }
            let feeAmount = (managerConfig.feeRate / 100 * parseInt(req.body.RMBAmount) * rate / 100).toFixed(2);
            let totalAmount = ((1 + managerConfig.feeRate / 100) * req.body.RMBAmount * rate / 100).toFixed(2);
            resolve([rate, managerConfig.feeRate, feeAmount, totalAmount]);

        } catch (err) {

            reject(err);
        }
    });
};
exports.getThisUserRcoinRate = async (req, res) => {
    try {
        let [rate, feeRate, feeAmount, totalAmount] = await getRate(req, res);

        return res.status(200).send({
            error_code: 0, error_msg: "OK", data: {
                rate: rate,
                feeRate: feeRate,
                feeAmount: feeAmount,
                totalAmount: totalAmount
            }
        });
    } catch (e) {

        return res.status(513).send({error_code: 513, error_msg: e});
    }

};


exports.addDGByALIBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        if (req.body.typeStr === `其他支付方式代付`) {
            if (tool.isEmpty(req.body.paymentInfo)  || tool.isEmpty(req.body.paymentInfo.friendAlipayAccount)) {
                return res.status(402).send({error_code: 402, error_msg: 'friendAlipayAccount can not be empty'});
            }
            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = req.body.paymentInfo.friendAlipayAccount;
            billObject.paymentInfo.paymentDFAccount = req.body.paymentInfo.paymentDFAccount;
            billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
        } else if (req.body.typeStr === `其他支付方式代购`) {
            billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
        } else {
            return res.status(403).send({error_code: 403, error_msg: 'typeStr has wrong value'});
        }
        req.body.rateType = `AlipayAndWechatRate`;
        let [rate, feeRate, feeAmount, totalAmount] = await getRate(req, res);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.chargeInfo = {};
        billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;
        billObject.chargeInfo.chargeAccount = req.body.chargeInfo.chargeAccount;
        billObject.chargeInfo.toOurAccount = req.body.chargeInfo.toOurAccount;
        let userObject = {};
        userObject.nickName = req.user.nickName;
        userObject.Rcoins = req.user.Rcoins;
        userObject.growthPoints = req.user.growthPoints;
        billObject.userInfo = userObject;
        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;

        await billObject.save();

        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (e) {

        return res.status(513).send({error_code: 513, error_msg: e});
    }
};
exports.addDGRcoinsBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        if (!req.user.Rcoins || !req.body.RMBAmount ||
            Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.RMBAmount) < 0) {
            return res.status(400).send({error_code: 400, error_msg: '要不起'});
        }
        if (req.body.typeStr === `R币代付`) {
            if (tool.isEmpty(req.body.paymentInfo)  || tool.isEmpty(req.body.paymentInfo.friendAlipayAccount)) {
                return res.status(402).send({error_code: 402, error_msg: 'friendAlipayAccount can not be empty'});
            }

            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.typeStr = req.body.typeStr;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = req.body.paymentInfo.friendAlipayAccount;
            billObject.paymentInfo.paymentDFAccount = req.body.paymentInfo.paymentDFAccount;
            billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);

        } else if (req.body.typeStr === `R币代购`) {
            billObject.isVirtualItem = null;
            billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
            billObject.typeStr = req.body.typeStr;
        } else {
            return res.status(403).send({error_code: 403, error_msg: 'typeStr has wrong value'});
        }

        req.body.rateType = `RcoinRate`;
        const [rate, feeRate, feeAmount, totalAmount] = await getRate(req, res);

        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.chargeInfo = {};
        billObject.chargeInfo.chargeMethod = `Rcoin`;

        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;

        let userObject = {};
        userObject.nickName = req.user.nickName;
        userObject.Rcoins = req.user.Rcoins;
        userObject.growthPoints = req.user.growthPoints;
        billObject.userInfo = userObject;
        await billObject.save();
        let recentRcoins = Number.parseInt(req.user.Rcoins) - Number.parseInt(billObject.RMBAmount);
        await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$set: {Rcoins: tool.encrypt(`` + recentRcoins)}}, {new: true});

        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (e) {
        console.log(e)
        return res.status(513).send({error_code: 513, error_msg: e});
    }
};

exports.getBills = async (req, res) => {
    try {

        let command = {};

        if (req.body.dealState) {
            command['dealState'] = {$eq: req.body.dealState};
        }

        let operator = {};
        if (req.body['order'] && req.body['sortBy']) {
            operator.sort = {};
            operator.sort[req.body['sortBy']] = parseInt(req.body['order']);
        }

        if (!tool.isEmpty(req.body['page']) && !tool.isEmpty(req.body['unit'])) {
            operator.skip = parseInt(req.body['page']) * parseInt(req.body['unit']);
            operator.limit = parseInt(req.body['unit']);
        }

        let personalInfo = await userModel.findOne({tel_number: req.user.tel_number});
        command['userID'] = {$eq: personalInfo._id};
        let billResult = await dgBillModel.find(command, {
            __v: 0,
            billStatementId: 0,
            _id: 0
        }, operator);
        let billCount = await dgBillModel.count({userID: personalInfo._id});

        return res.status(200).send({error_code: 503, error_msg: billResult, nofdata: billCount});

    } catch (err) {
        return res.status(503).send({error_code: 503, error_msg: err});
    }

};

exports.addReplacePostageBill = async (req, res) => {

    try {
        let replacePostageBillEntity = new replacePostageBillModel();

        for (let index in req.body) {
            if (!tool.isEmpty(req.body[index])) {
                replacePostageBillEntity[index] = req.body[index];
            }
        }
        replacePostageBillEntity.chargeDate = new Date();
        replacePostageBillEntity.status = 2;
        let dgBillEntity = await dgBillModel.findOneAndUpdate({billID: req.body.billID, userUUid: req.user.uuid},
            {$set: {replacePostage: replacePostageBillEntity, payFreight: 1}}, {new: true}).populate(`processOrder`);
        console.log(dgBillEntity);
        if (!dgBillEntity) {
            return res.status(200).json({error_msg: `OK, but nothing has been changed`, error_code: "0"});
        }
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    } catch (e) {

        return res.status(500).json({error_msg: e, error_code: "500"});

    }


};
exports.payReplacePostage = async (req, res) => {

    try {
        let replacePostageBillEntity = {};

        for (let index in req.body) {
            if (!tool.isEmpty(req.body[index])) {
                replacePostageBillEntity[index] = req.body[index];
            }
        }
        console.log(replacePostageBillEntity);
        let dgBillEntity = await dgBillModel.findOneAndUpdate({billID: req.body.billID, userUUid: req.user.uuid},
            {$set: {"replacePostage.replacePostagePayment": replacePostageBillEntity}}, {new: true})
            .populate(`processOrder`);

        if (!dgBillEntity) {
            return res.status(200).json({error_msg: `OK, but nothing has been changed`, error_code: "0"});
        }
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    } catch (e) {

        return res.status(500).json({error_msg: e, error_code: "500"});

    }


};