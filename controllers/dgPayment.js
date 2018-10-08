const dgBillModel = require('../modules/dgBill').dgBillModel;
const replacePostageBillModel = require('../modules/dgBill').replacePostageBillModel;
const baseRateModelModel = require('../modules/managerConfigFeatures').baseRateModel;
const userModel = require('../modules/userAccount').userAccountModel;
const searchModel = require('../controllers/searchModel');
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');
const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
let getBaseRate = (req, res) => {
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

            let resultArray2 = chargeResult.concat(dgBillResult);

        } catch (err) {
            reject(err);
        }


    });


};

exports.findThisUserRcoinRecord = async (req, res) => {
    let operator = searchModel.pageModel(req);
    let searchCondition = {
        userUUid: req.user.uuid,
        $or: [
            {"typeStr": `R币充值`},
            {"typeStr": `R币代购`},
            {"typeStr": `R币代付`}
        ]
    };
    let showCondition = {typeStr: 1, billID: 1, RMBAmount: 1, rate: 1, NtdAmount: 1, dealState: 1, created_at: 1};
    try {
        let resultArray2 = await findTradeDAO(req, res, {
            searchCondition: searchCondition,
            showCondition: showCondition
        }, operator);

        return res.status(200).send({
            error_code: 0, error_msg: "OK", data: resultArray2
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
            if (tool.isEmpty(req.body.paymentInfo) || tool.isEmpty(req.body.paymentInfo.friendAlipayAccount)) {
                return res.status(402).send({error_code: 402, error_msg: 'friendAlipayAccount can not be empty'});
            }

            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = req.body.paymentInfo.friendAlipayAccount;
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

        billObject.is_firstOrder = !req.user.userStatus.isFirstTimePaid;

        billObject.typeStr = req.body.typeStr;
        let user = {};
        if (!req.user.userStatus.isFirstTimePaid) {
            billObject.is_firstOrder = true;
        }
        req.user = user;
        let userObject = {};
        userObject.nickName = req.user.nickName;
        userObject.Rcoins = req.user.Rcoins;
        userObject.growthPoints = req.user.growthPoints;
        billObject.userInfo = userObject;
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
        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;

        if (!req.user.Rcoins || !req.body.RMBAmount ||
            Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.RMBAmount) < 0) {
            return res.status(400).send({error_code: 400, error_msg: '要不起'});
        }
        if (req.body.itemInfo.itemLink.search("tmall.com") !== -1) {
            billObject.itemInfo.itemWebType = "tmall";

        } else if (req.body.itemInfo.itemLink.search("taobao.com") !== -1) {
            billObject.itemInfo.itemWebType = "taobao";
        } else {
            billObject.itemInfo.itemWebType = "others";
        }
        if (req.body.typeStr === `R币代付`) {
            if (tool.isEmpty(req.body.paymentInfo) || tool.isEmpty(req.body.paymentInfo.friendAlipayAccount)) {
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
            billObject.itemInfo.itemWebType = "others";
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

        return res.status(513).send({error_code: 513, error_msg: e});
    }
};

exports.getBills = async (req, res) => {
    try {

        let command = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `typeStr`, "require": false},
            {"filedName": `dealState`, "require": false}
        );
        //command.userUUid = req.user.uuid;
        // if (req.body['beginLowPrice'] && req.body['beginHighPrice']) {
        //     command['RMBAmount'] = {
        //         $lt: new Date(req.query['beginLowPrice']),
        //         $gt: new Date(req.query['beginHighPrice'])
        //     };
        // }

        command = command.concat(searchModel.pageModel(req));
        command = command.concat(searchModel.createAndUpdateTimeSearchModel(req));
        let operator = searchModel.pageModel(req);
        //
        // if (req.body['order'] && req.body['sortBy']) {
        //     operator.sort = {};
        //     operator.sort[req.body['sortBy']] = parseInt(req.body['order']);
        // }

        findTradeDAO(req, res, command, operator);

        let billResult = await dgBillModel.find(command, {
            typeStr: 1, billID: 1, RMBAmount: 1, rate: 1, NtdAmount: 1, dealState: 1, created_at: 1, dealDate: 1
        }, operator);
        let billCount = await dgBillModel.count(command);
        // let resultArray = [{tradeType: `payment`, amount: 50, credit: 900, dealTime: 1538122531845},
        //     {tradeType: `payment`, orderID: "Z12345696", amount: 56, credit: 950, dealTime: 1538122531845},
        //     {tradeType: `recharge`, orderID: "Z12345692", amount: 100, credit: 1006, dealTime: 1538122531845},
        //     {tradeType: `payment`, orderID: "Z12345691", amount: 10, credit: 996, dealTime: 1538122531845},
        //     {tradeType: `recharge`, orderID: "Z12345698", amount: 96, credit: 1006, dealTime: 1538122531845},
        //     {tradeType: `recharge`, orderID: "Z12345691", amount: 110, credit: 910, dealTime: 1538122531845},
        //     {tradeType: `payment`, orderID: "Z12345692", amount: 200, credit: 800, dealTime: 1538122531845},
        //     {tradeType: `recharge`, orderID: "Z12345691", amount: 1000, credit: 1000, dealTime: 1538122531845}];
        // return res.status(200).send({
        //     error_code: 0, error_msg: "OK", data: resultArray
        // });
        return res.status(200).send({error_code: 200, error_msg: billResult, nofdata: billCount});

    } catch (err) {
        console.log(err)
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
exports.getRate = getRate;