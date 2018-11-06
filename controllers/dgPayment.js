const dgBillModel = require('../modules/dgBill').dgBillModel;
const replacePostageBillModel = require('../modules/dgBill').replacePostageBillModel;
const baseRateModelModel = require('../modules/managerConfigFeatures').baseRateModel;
const userModel = require('../modules/userAccount').userAccountModel;
const searchModel = require('../controllers/searchModel');
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');
const logger = require('../logging/logging').logger;
const chargeBillModel = require('../modules/chargeBill').chargeBillModel;

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
            let feeAmount = (managerConfig.feeRate / 100 * parseInt(req.body.RMBAmount) * rate).toFixed(2);
            let totalAmount = ((1 + managerConfig.feeRate / 100) * req.body.RMBAmount * rate).toFixed(2);
            resolve([rate, managerConfig.feeRate, feeAmount, totalAmount]);

        } catch (err) {

            reject(err);
        }
    });
};
exports.getThisUserBasicRate = async (req, res) => {
    try {

        req.body.RMBAmount = 1;
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
            let dgBill_count = await dgBillModel.count(searchArgs.searchCondition);
            let chargeBil_count = await chargeBillModel.count(searchArgs.searchCondition);

            let A_model, A_operator;
            let B_model, B_operator;

            if (dgBill_count < chargeBil_count) {
                A_model = dgBillModel;
                B_model = chargeBillModel;
            } else {
                B_model = dgBillModel;
                A_model = chargeBillModel;
            }
            {
                A_operator = {
                    skip: Math.round(operator.skip / 2),
                    limit: Math.round(parseInt(operator.limit) / 2)
                };

                let A_Result = await A_model.find(
                    searchArgs.searchCondition,
                    searchArgs.showCondition,
                    A_operator);

                if (A_Result.length === 0) {
                    B_operator = {
                        skip: operator.skip - (dgBill_count < chargeBil_count ? dgBill_count : chargeBil_count),
                        limit: operator.limit
                    }
                } else {
                    B_operator = {
                        skip: Math.round(operator.skip / 2),
                        limit: Math.round(parseInt(operator.limit) - A_Result.length)
                    };
                }

                let B_result = await B_model.find(
                    searchArgs.searchCondition,
                    searchArgs.showCondition,
                    B_operator);


                let resultArray = A_Result.concat(B_result);
                resolve([resultArray, chargeBil_count + dgBill_count]);
            }

        } catch (err) {

            reject(err);
        }

    });


};

exports.findThisUserRcoinRecord = async (req, res) => {
    let operator = searchModel.pageModel(req, res);
    let searchArray = [];

    if (req.body[`tradeType`] === `custom`) {
        searchArray = [
            {"typeStr": `淘寶/天貓/阿里巴巴代付`},
            {"typeStr": `其他網站代購`}
        ]
    } else if (req.body[`tradeType`] === `recharge`) {
        searchArray = [
            {"typeStr": `R幣儲值`},
            {"typeStr": `支付寶儲值`},
            {"typeStr": `微信錢包儲值`}
        ]
    } else {

        searchArray = [
            {"typeStr": `其他網站代購`},
            {"typeStr": `淘寶/天貓/阿里巴巴代付`}
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

// exports.addDGByALIBill = async (req, res) => {
//
//     try {
//         let billObject = new dgBillModel();
//         billObject.itemInfo = {};
//         billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
//         billObject.itemInfo.itemName = req.body.itemInfo.itemName;
//
//         if (req.body.itemInfo.itemLink.search("detail.tmall.com") !== -1) {
//             billObject.itemInfo.itemWebType = "tmall";
//
//         } else if (req.body.itemInfo.itemLink.search("taobao.com") !== -1) {
//             billObject.itemInfo.itemWebType = "taobao";
//         } else {
//             billObject.itemInfo.itemWebType = "others";
//         }
//         if (req.body.typeStr === `淘寶/天貓/阿里巴巴代付`) {
//
//             billObject.isVirtualItem = req.body.isVirtualItem;
//             billObject.paymentInfo.paymentMethod = 'Alipay';
//             billObject.paymentInfo.friendAlipayAccount = `yubao0001@126.com`;
//
//             billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
//
//             for (let alipayAccount of req.user.aliPayAccounts) {
//
//                 if (alipayAccount.user_id.toString() === req.body.paymentInfo.paymentDFAccount.toString()) {
//                     billObject.paymentInfo.paymentDFAccount  = {
//                         user_id: alipayAccount.user_id,
//                         avatar: alipayAccount.avatar,
//                         nickname: alipayAccount.nick_name
//                     }
//                 }
//
//             }
//
//         } else if (req.body.typeStr === `其他網站代購`) {
//             billObject.itemInfo.itemWebType = "others";
//             billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
//         } else {
//             return res.status(403).send({error_code: 403, error_msg: 'typeStr has wrong value'});
//         }
//         req.body.rateType = `AlipayAndWechatRate`;
//         let [rate, feeRate, feeAmount, totalAmount] = await getRate(req, res);
//         billObject.RMBAmount = req.body.RMBAmount;
//         billObject.feeRate = feeRate;
//         billObject.userUUid = req.user.uuid;
//         billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
//         billObject.comment = req.body.comment;
//         billObject.NtdAmount = totalAmount;
//         billObject.rate = rate;
//         billObject.fee = feeAmount;
//         billObject.chargeInfo = {};
//         billObject.chargeInfo.chargeMethod = req.body.chargeInfo.chargeMethod;
//         billObject.chargeInfo.chargeAccount = req.body.chargeInfo.chargeAccount;
//         billObject.chargeInfo.toOurAccount = req.body.chargeInfo.toOurAccount;
//         billObject.isVirtualItem = req.body.isVirtualItem;
//         billObject.is_firstOrder = !req.user.userStatus.isFirstTimePaid;
//
//         billObject.typeStr = req.body.typeStr;
//         let user = {};
//         if (!req.user.userStatus.isFirstTimePaid) {
//             billObject.is_firstOrder = true;
//         }
//         req.user = user;
//         let userObject = {};
//         userObject.tel_number = req.user.tel_number;
//         userObject.email_address = req.user.email_address;
//         userObject.realName = req.user.realName;
//         userObject.nickName = req.user.nickName;
//         userObject.Rcoins = req.user.Rcoins;
//         userObject.VIPLevel = req.user.VIPLevel;
//         billObject.userInfo = userObject;
//         await billObject.save();
//
//         logger.info("addDGByALIBill", {
//             level: req.user.role,
//             user: req.user.uuid,
//             email: req.user.email_address,
//             location: (new Error().stack).split("at ")[1],
//             body: req.body
//         });
//         return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
//     }
//     catch (err) {
//         logger.error("addDGByALIBill", {
//             level: req.user.role,
//             response: `addDGByALIBill Failed`,
//             user: req.user.uuid,
//             email: req.user.email_address,
//             location: (new Error().stack).split("at ")[1],
//             body: req.body,
//             error: err
//         });
//         return res.status(500).send({error_code: 500, error_msg: `addDGByALIBill Failed`});
//     }
// };
exports.addDGRcoinsBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        billObject.itemInfo.itemName = req.body.itemInfo.itemName;

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
        if (req.body.typeStr === `淘寶/天貓/阿里巴巴代付`) {

            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.typeStr = req.body.typeStr;
            billObject.paymentInfo.paymentMethod = 'Alipay';
            billObject.paymentInfo.friendAlipayAccount = "yubao0001@126.com";

            billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
            for (let alipayAccount of req.user.aliPayAccounts) {

                if (alipayAccount.user_id.toString() === req.body.paymentInfo.paymentDFAccount.toString()) {
                    billObject.paymentInfo.paymentDFAccount = {
                        user_id: alipayAccount.user_id,
                        avatar: alipayAccount.avatar,
                        nickname: alipayAccount.nick_name
                    }
                }

            }
        } else if (req.body.typeStr === `其他網站代購`) {
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
        userObject.email_address = req.user.email_address;
        userObject.realName = tool.isEmpty(req.user.realName) ? `尚未实名` : req.user.realName;
        userObject.nickName = req.user.nickName;
        userObject.Rcoins = req.user.Rcoins;
        userObject.VIPLevel = req.user.VIPLevel;

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
            typeStr: 1,
            billID: 1,
            RMBAmount: 1,
            rate: 1,
            NtdAmount: 1,
            dealState: 1,
            typeState: 1,
            created_at: 1,
            dealDate: 1
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `typeStr`, "require": false},
            {"filedName": `dealState`, "require": false},
        );
        if (!tool.isEmpty(req.body.billID)) {
            command.searchCondition = Object.assign(command.searchCondition, {billID: {$regex: `.*${req.body.billID}.*`}});
        }

        command.searchCondition = Object.assign(command.searchCondition, searchModel.createAndUpdateTimeSearchModel(req, res));

        let operator = searchModel.pageModel(req, res);

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
        let replacePostageBillEntity = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `comment`, "require": false},
            {"filedName": `postageAmount`, "require": true},
            {"filedName": `replaceTime`, "require": false},
            {"filedName": `billID`, "require": true},
            {"filedName": `status`, "require": true}
        )

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

exports.findPostage = async (req, res) => {

    try {
        let searcher = {replacePostage: {"$exists": true}};
        let operator = searchModel.pageModel(req);

        searcher = Object.assign(searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `replacePostage.status`, "require": false},
            {"filedName": `userInfo.tel_number`, "require": false},
            {"filedName": `billID`, "require": false},
            {"filedName": `userInfo.email_address`, "require": false}
        ), searcher);

        if (!tool.isEmpty(req.body['beforeDate']) && !tool.isEmpty(req.body['afterDate']) &&
            new Date(req.body['beforeDate']) < new Date(req.body['afterDate'])) {
            return res.status(400).json({error_msg: `beforeDate can not less than afterDate`, error_code: "400"});
        }
        if (!tool.isEmpty(req.body[`beforeDate`])) {
            searcher["replacePostage.replaceTime"] = {$lte: new Date(req.body['beforeDate'])};
        }

        if (!tool.isEmpty(req.body[`afterDate`])) {

            if (!tool.isEmpty(searcher["replacePostage.replaceTime"])) {
                searcher["replacePostage.replaceTime"] = Object.assign({
                    $gte: new Date(req.body['afterDate'])
                }, searcher["replacePostage.replaceTime"]);
            } else {
                searcher["replacePostage.replaceTime"] = {$gte: new Date(req.body['afterDate'])};
            }
        }
        console.log(searcher)
        let dgBillEntity = await dgBillModel.find(searcher, {
            "userInfo.tel_number": 1, "userInfo.email_address": 1, "replacePostage.comment": 1, billID: 1,
            "replacePostage.postageAmount": 1, "replacePostage.status": 1, "replacePostage.replaceTime": 1
        }, operator);
        let count = await dgBillModel.count(searcher);
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity, nofdata: count});
    } catch (err) {

        logger.error("findReplacePostage", {
            level: req.user.role,
            response: `findReplacePostage Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(400).json({error_msg: err.message, error_code: "500"});
    }
}
exports.payReplacePostage = async (req, res) => {

    try {
        let replacePostageBillEntity = {};
        searchModel.requestCheckBox(req, "RMBAmount", "rechargeInfo",
            "rechargeInfo.rechargeToAccount", "chargeInfo", "chargeInfo.chargeFromAccount");

        for (let index in req.body) {
            if (!tool.isEmpty(req.body[index])) {
                replacePostageBillEntity[index] = req.body[index];
            }
        }

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