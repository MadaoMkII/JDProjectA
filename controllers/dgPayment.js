const dgBillModel = require('../modules/dgBill').dgBillModel;
const replacePostageBillModel = require('../modules/dgBill').replacePostageBillModel;
const baseRateModelModel = require('../modules/managerConfigFeatures').baseRateModel;
const userModel = require('../modules/userAccount').userAccountModel;
const searchModel = require('../controllers/searchModel');
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');
const logger = require('../logging/logging').logger;
const chargeBillModel = require('../modules/chargeBill').chargeBillModel;


let getBaseRate = (req) => {
    return new Promise((resolve, reject) => {

            baseRateModelModel.findOne({VIPLevel: req.user.VIPLevel}, (err, data) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }

            });
        }
    );
};


exports.setBaseRateOutside = async (req, res) => {

    try {
        let baseRateModelEntity = new baseRateModelModel();
        baseRateModelEntity.VIPLevel = req.body.VIPLevel;
        baseRateModelEntity.detailRate = req.body.detailRate;
        let result = await baseRateModelModel.findOneAndUpdate({VIPLevel: baseRateModelEntity.VIPLevel},
            {$set: {detailRate: baseRateModelEntity.detailRate}}
            , {upsert: true, new: true});
        return res.status(200).send({error_code: 200, error_msg: `OK`, data: result});
    } catch (e) {

        return res.status(403).send({error_code: 403, error_msg: `Error when try to save`});
    }

};

exports.getBaseRateOutside = async (req, res) => {
    try {
        let baseRate = await getBaseRate(req, res);
        return res.status(200).send({error_code: 200, error_msg: `OK`, data: baseRate});
    } catch (e) {
        return res.status(403).send({error_code: 403, error_msg: `Need login first`});
    }

};

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


let findTradeDAO = async (req, res, searchArgs, operator) => {


    return new Promise(async (resolve, reject) => {
        try {
            let chargeResult = await chargeBillModel.find(
                searchArgs.searchCondition,
                searchArgs.showCondition,
                operator);

            let dgBillResult = await dgBillModel.find(
                searchArgs.searchCondition,
                searchArgs.showCondition,
                operator);


            let count = await dgBillModel.count(searchArgs.searchCondition) +
                await chargeBillModel.count(searchArgs.searchCondition);

            let resultArray = chargeResult.concat(dgBillResult);
            resolve([resultArray, count]);
        } catch (err) {
            reject(err);
        }

    });


};

exports.findThisUserRcoinRecord = async (req, res) => {
    let operator = searchModel.pageModel(req, res);
    let searchArray = [];

    if (req.body[`tradeType`] === `支出`) {
        searchArray = [
            {"typeStr": `R币代购`},
            {"typeStr": `R币代付`}
        ]
    } else if (req.body[`tradeType`] === `充值`) {
        searchArray = [
            {"typeStr": `R币充值`}
        ]
    } else {

        searchArray = [
            {"typeStr": `R币充值`},
            {"typeStr": `R币代购`},
            {"typeStr": `R币代付`}
        ]

    }
    let searchCondition;
    if (req.user.role === `User`) {
        searchCondition = {
            userUUid: req.user.userUUid,
            $or: searchArray
        };
    } else {
        searchCondition = {
            userUUid: req.body.userUUid,
            $or: searchArray
        };
    }


    let showCondition = {typeStr: 1, billID: 1, RMBAmount: 1, rate: 1, NtdAmount: 1, dealState: 1, created_at: 1};
    try {
        let [resultArray2, count] = await findTradeDAO(req, res, {
            searchCondition: searchCondition,
            showCondition: showCondition
        }, operator);

        return res.status(200).send({
            error_code: 0, error_msg: "OK", data: resultArray2, nofdata: count
        });
    } catch (e) {
        return res.status(513).send({error_code: 513, error_msg: e});
    }

};

exports.addDGByALIBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        if (req.body.itemInfo.itemLink.search("detail.tmall.com") !== -1) {
            billObject.itemInfo.itemWebType = "tmall";

        } else if (req.body.itemInfo.itemLink.search("taobao.com") !== -1) {
            billObject.itemInfo.itemWebType = "taobao";
        } else {
            billObject.itemInfo.itemWebType = "others";
        }
        if (req.body.typeStr === `其他支付方式代付`) {

            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = `yubao0001@126.com`;
            billObject.paymentInfo.paymentDFAccount = req.body.paymentInfo.paymentDFAccount;
            billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
        } else if (req.body.typeStr === `其他支付方式代购`) {
            billObject.itemInfo.itemWebType = "others";
            billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
        } else {
            return res.status(403).send({error_code: 403, error_msg: 'typeStr has wrong value'});
        }
        req.body.rateType = `AlipayAndWechatRate`;
        let [rate, feeRate, feeAmount, totalAmount] = await getRate(req, res);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.feeRate = feeRate;
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
        billObject.isVirtualItem = req.body.isVirtualItem;
        billObject.is_firstOrder = !req.user.userStatus.isFirstTimePaid;

        billObject.typeStr = req.body.typeStr;
        let user = {};
        if (!req.user.userStatus.isFirstTimePaid) {
            billObject.is_firstOrder = true;
        }
        req.user = user;
        let userObject = {};
        userObject.tel_number = req.user.tel_number;
        userObject.Rcoins = req.user.Rcoins;
        userObject.growthPoints = req.user.growthPoints;
        billObject.userInfo = userObject;
        await billObject.save();

        logger.info("addDGByALIBill", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (err) {
        logger.error("addDGByALIBill", {
            level: req.user.role,
            response: `addDGByALIBill Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).send({error_code: 500, error_msg: `addDGByALIBill Failed`});
    }
};
exports.addDGRcoinsBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;

        if (!req.user.Rcoins || !req.body.RMBAmount ||
            Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.RMBAmount) < 0) {
            return res.status(400).send({error_code: 400, error_msg: '要不起'});
        }

        if (req.body.itemInfo.itemLink.search("detail.tmall.com") !== -1) {
            billObject.itemInfo.itemWebType = "tmall";

        } else if (req.body.itemInfo.itemLink.search("taobao.com") !== -1) {
            billObject.itemInfo.itemWebType = "taobao";
        } else {
            billObject.itemInfo.itemWebType = "others";
        }
        if (req.body.typeStr === `R币代付`) {

            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.typeStr = req.body.typeStr;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = "yubao0001@126.com";
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
        billObject.feeRate = feeRate;
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.NtdAmount = totalAmount;
        billObject.rate = rate;
        billObject.fee = feeAmount;
        billObject.chargeInfo = {};
        billObject.chargeInfo.chargeMethod = `Rcoin`;

        billObject.typeState = 1;
        let userObject = {};
        userObject.tel_number = req.user.tel_number;
        userObject.Rcoins = req.user.Rcoins;
        userObject.growthPoints = req.user.growthPoints;
        billObject.userInfo = userObject;
        await billObject.save();
        let recentRcoins = Number.parseInt(req.user.Rcoins) - Number.parseInt(billObject.RMBAmount);
        await userModel.findOneAndUpdate({uuid: req.user.uuid},
            {$set: {Rcoins: tool.encrypt(`` + recentRcoins)}}, {new: true});

        logger.info("addDGRcoinsBill", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (err) {

        logger.error("addDGRcoinsBill", {
            level: req.user.role,
            response: `addDGRcoinsBill Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).send({error_code: 500, error_msg: `addDGRcoinsBill Failed`});
    }
};

exports.adminGetBills = async (req, res) => {

    try {

        let command = {};
        command.showCondition = {
            typeStr: 1, billID: 1, RMBAmount: 1, rate: 1, NtdAmount: 1, dealState: 1, created_at: 1, dealDate: 1
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `typeStr`, "require": false},
            {"filedName": `dealState`, "require": false}
        );

        command.searchCondition = Object.assign(command.searchCondition, searchModel.createAndUpdateTimeSearchModel(req));
        let operator = searchModel.pageModel(req);

        let [result, count] = await findTradeDAO(req, res, command, operator);

        return res.status(200).send({error_code: 0, error_msg: `OK`, data: result, nofdata: count});

    } catch (err) {
        logger.error("adminGetBills", {
            level: req.user.role,
            response: `adminGetBills Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(503).send({error_code: 503, error_msg: err});
    }

};

exports.addReplacePostageBill = async (req, res) => {

    try {
        let dgResult = await dgBillModel.findOne({billID: req.body.billID});
        if (!dgResult) {
            return res.status(404).json({error_msg: `can not find bill`, error_code: "404"});
        }
        let replacePostageBillEntity = new replacePostageBillModel();

        for (let index in req.body) {
            if (!tool.isEmpty(req.body[index])) {
                replacePostageBillEntity[index] = req.body[index];
            }
        }
        replacePostageBillEntity.chargeDate = new Date();
        let dgBillEntity = await dgBillModel.findOneAndUpdate({billID: req.body.billID},
            {$set: {replacePostage: replacePostageBillEntity, payFreight: 1}}, {new: true}).populate(`processOrder`);

        if (!dgBillEntity) {
            return res.status(200).json({error_msg: `OK, but nothing has been changed`, error_code: "0"});
        }
        logger.info("addReplacePostageBill", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    } catch (err) {
        logger.error("addReplacePostageBill", {
            level: req.user.role,
            response: `addReplacePostageBill Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).json({error_msg: `addReplacePostageBill Failed`, error_code: "500"});

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
        logger.info("payReplacePostage", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    } catch (err) {

        logger.error("payReplacePostage", {
            level: req.user.role,
            response: `payReplacePostage Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(500).json({error_msg: `Pay Replace Postage Failed`, error_code: "500"});

    }


};
exports.getRate = getRate;