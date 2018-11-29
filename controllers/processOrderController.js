const processOrderModel = require('../modules/processOrder').processOrderModel;
const myEventModel = require('../modules/userAccount').myEventModel;
const dgBillModel = require('../modules/dgBill').dgBillModel;
const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
const tools = require('../config/tools');
const userModel = require('../modules/userAccount').userAccountModel;
const dataAnalystModel = require('../modules/dataAnalyst').dataAnalystModel;
const logger = require('../logging/logging').logger;
const searchModel = require('../controllers/searchModel');

exports.getAlreadySolved = async (req, res) => {

    try {
        let operator = searchModel.pageModel(req);
        let searcher = {replacePostage: {"$exists": true}};
        if (req.user.role === `User`) {
            Object.assign(searcher, {userUUid: req.user.uuid});

        }
        let counts = await dgBillModel.countDocumentsDocuments(searcher);
        let result = await dgBillModel.find(searcher, operator);
        return res.status(200).send({error_code: 200, error_msg: `OK`, data: result, nofdata: counts});
    } catch (err) {
        return res.status(403).send({error_code: 403, error_msg: `Error when try to save`});
    }

};

exports.getDataAnalyst = async (req, res) => {
    try {
        let searchConditions = {};

        if (req.body['beforeDate'] && req.body['afterDate']) {
            searchConditions['dateClock'] = {
                $lte: new Date(req.body['beforeDate']),
                $gte: new Date(req.body['afterDate'])
            };
        }

        let result = await dataAnalystModel.aggregate([
                {
                    $match: searchConditions
                },
                {
                    $group: {
                        _id: '$itemWebType',
                        totalAmount: {$sum: `$amount`},
                        count: {$sum: `$count`}
                        // avg: {$avg: '$price'}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        itemWebType: "$_id",
                        count: 1,
                        totalAmount: 1
                    }
                }
            ]
        );
        let resultMap = new Map();

        resultMap.set(`淘寶/天貓/阿里巴巴代付`, {"totalAmount": 0, "count": 0});
        resultMap.set(`支付寶儲值`, {"totalAmount": 0, "count": 0});
        resultMap.set(`微信錢包儲值`, {"totalAmount": 0, "count": 0});
        resultMap.set(`其他網站代購`, {"totalAmount": 0, "count": 0});
        resultMap.set(`R幣儲值`, {"totalAmount": 0, "count": 0});


        for (let resultEntityKey of result) {
            resultMap.set(resultEntityKey.itemWebType,
                {"totalAmount": resultEntityKey.totalAmount, "count": resultEntityKey.countDocumentsDocuments});
        }
        let lastResult = [];
        resultMap.forEach((value, key) => {
            lastResult.push({itemWebType: key, count: value.countDocumentsDocuments, totalAmount: value.totalAmount});
        });
        //let result = await dataAnalystModel.find(searchConditions, {}, {"group": `itemWebType`});
        return res.status(200).json({error_msg: 'ok', error_code: "0", data: lastResult});
    } catch (e) {

        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};
exports.returnRcoin = async (req, res) => {

    try {
        let flag = true;
        let billResult = await dgBillModel.findOne({billID: req.body.billID});

        if (!billResult) {
            billResult = await chargeBillModel.findOne({billID: req.body.billID});
            flag = false;
            if (!billResult) {
                return res.status(404).json({error_msg: 'Can not find this Bill', error_code: "404"});
            }

            if (billResult.typeStr === `R幣儲值`) {

                return res.status(405).json({error_msg: 'R幣儲值 type bill can not return', error_code: "405"});
            }
        }
        if (billResult.dealState === 4) {
            return res.status(400).json({error_msg: 'This bill already has been Return', error_code: "400"});

        }
        let billUser = await userModel.findOne({uuid: billResult.userUUid});

        let myEvent = new myEventModel();
        myEvent.eventType = `Rcoin`;
        myEvent.amount = billResult.RMBAmount;
        myEvent.behavior = `bill cancel return`;

        let amountNew = parseInt(billResult.RMBAmount) + parseInt(billUser.Rcoins);
        await userModel.findOneAndUpdate({uuid: billResult.userUUid}, {
            $push: {whatHappenedToMe: myEvent},
            $set: {Rcoins: tools.encrypt(amountNew)}
        }, {new: true});
        let bill_return_Result;
        if (flag) {
            bill_return_Result =
                await dgBillModel.findOneAndUpdate({billID: req.body.billID}, {$set: {dealState: 4}}, {new: true});
        } else {
            bill_return_Result =
                await chargeBillModel.findOneAndUpdate({billID: req.body.billID}, {$set: {dealState: 4}}, {new: true});
        }
        return res.status(200).json({error_msg: 'ok', error_code: "0", data: bill_return_Result});
    } catch (err) {
        return res.status(500).json({error_msg: 'error', error_code: "500"});
    }


};


exports.setOrderStatus = async (req, res) => {

    try {
        let setObject = {};
        if (tools.isEmpty(req.body.billID)) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }

        if (!tools.isEmpty(req.body.typeState)) {

            setObject.typeState = req.body.typeState;
        }

        if (!tools.isEmpty(req.body.dealState)) {

            setObject.dealState = req.body.dealState;
        }

        let newOrder;
        newOrder = await dgBillModel.findOneAndUpdate({billID: req.body.billID}, {$set: setObject}, {new: true});

        if (!newOrder) {
            newOrder = await chargeBillModel.findOneAndUpdate({billID: req.body.billID}, {$set: setObject}, {new: true});

        }
        if (!newOrder) {
            return res.status(404).json({error_msg: `can not find record by this  billID`, error_code: "404"});
        }


        logger.warn("setOrderStatus", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: newOrder});

    } catch (err) {
        logger.error("setOrderStatus", {
            level: req.user.role,
            response: `setOrderStatus Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error_massage: err
        });
        return res.status(500).json({error_msg: `set Order Status Failed`, error_code: "500"});
    }


};
exports.addProcessOrder = async (req, res) => {

    try {

        let processOrderObject = new processOrderModel();

        if (tools.isEmpty(req.body.billID)) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }
        let chargeBill = await dgBillModel.findOne({billID: req.body.billID});
        if (chargeBill.processOrder && req.user.role === `Admin`) {
            return res.status(201).json({
                error_msg: `this bills has already been processed`,
                error_code: "201"
            });
        }
        if (parseInt(chargeBill.RMBAmount) !== parseInt(req.body.chargeAmount)) {

            return res.status(400).json({error_msg: `RMBAmount input wrong`, error_code: "400"});
        }
        if (tools.isEmpty(chargeBill) ||
            chargeBill.typeStr === `R幣儲值` ||
            chargeBill.typeStr === `支付寶儲值` ||
            chargeBill.typeStr === `微信錢包儲值`) {
            return res.status(400).json({
                error_msg: `this API is only used to deal with item bills`,
                error_code: "400"
            });
        }
        processOrderObject.imageFilesNames = req.body.imageFilesNames;
        processOrderObject.chargeDate = req.body.chargeDate ? req.body.chargeDate : new Date();
        processOrderObject.chargeAmount = req.body.chargeAmount;
        processOrderObject.comment = req.body.comment;
        processOrderObject.accountWeUsed = req.body.accountWeUsed;
        processOrderObject.billID = req.body.billID;

        await processOrderObject.save();
        let dgBill = await dgBillModel.findOneAndUpdate({billID: req.body.billID},
            {
                $set: {
                    processOrder: processOrderObject,
                    dealState: 1,
                    typeState: 1
                }
            }, {new: true});


        let userResult;

        if (dgBill.typeStr === `淘寶/天貓/阿里巴巴代付` &&
            dgBill.is_firstOrder === true &&
            dgBill.paymentInfo.paymentMethod === "Alipay") {

            let tempEvent = new myEventModel();
            tempEvent.eventType = `Alipay`;
            tempEvent.amount = dgBill.RMBAmount;
            tempEvent.pointChange = 10;
            tempEvent.behavior = `first Alipay consumption`;

            userResult = await userModel.findOneAndUpdate({uuid: dgBill.userUUid}, {
                $inc: {growthPoints: 10},
                $push: {whatHappenedToMe: tempEvent},
                $set: {"userStatus.isFirstTimePaid": true}
            }, {new: true});
        } else {
            let tempEvent = new myEventModel();
            tempEvent.eventType = `Alipay`;
            tempEvent.pointChange = 1;
            tempEvent.amount = dgBill.RMBAmount;
            tempEvent.behavior = `consumption`;
            userResult = await userModel.findOneAndUpdate({uuid: dgBill.userUUid}, {
                $inc: {growthPoints: 1},
                $push: {whatHappenedToMe: tempEvent}
            }, {new: true});

        }

        let giveThemMyEvent = new myEventModel();
        giveThemMyEvent.eventType = `referral consumption share`;
        giveThemMyEvent.amount = dgBill.amount;
        giveThemMyEvent.pointChange = 10;
        giveThemMyEvent.referralsUUID = dgBill.userUUid;
        //content: `xxx`,

        if (!tools.isEmpty(userResult.referrer) && !tools.isEmpty(userResult.referrer.referrerUUID)) {
            await userModel.findOneAndUpdate({uuid: userResult.referrer.referrerUUID}, {
                $inc: {growthPoints: 10}, $push: {whatHappenedToMe: giveThemMyEvent}
            }, {new: true});//日子

        }
        let myDate = new Date();

        await dataAnalystModel.findOneAndUpdate({
            dateClock: new Date(`${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`),
            itemWebType: dgBill.typeStr
        }, {$inc: {count: 1, amount: dgBill.NtdAmount}}, {new: true, upsert: true});

        logger.warn("addProcessOrder", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBill});
    }
    catch (e) {

        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};

exports.addProcessOrderForCharge = async (req, res) => {
    try {

        let chargeBill = await chargeBillModel.findOne({billID: req.body.billID});


        if (tools.isEmpty(chargeBill) || chargeBill.typeStr !== `R幣儲值` && chargeBill.typeStr !== `微信錢包儲值` &&
            chargeBill.typeStr !== `支付寶儲值`) {
            return res.status(400).json({
                error_msg: `this API is only used to deal with recharge bills`,
                error_code: "400"
            });
        }
        if (chargeBill.processOrder && req.user.role === `Admin`) {
            return res.status(201).json({
                error_msg: `this bills has already been processed`,
                error_code: "201"
            });
        }
        let processOrderObject = new processOrderModel();

        if (tools.isEmpty(req.body[`billID`])) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }


        processOrderObject.chargeDate = req.body.chargeDate ? req.body.chargeDate : new Date();
        processOrderObject.chargeAmount = req.body.chargeAmount;
        processOrderObject.comment = req.body.comment;
        processOrderObject.imageFilesNames = req.body.imageFilesNames;
        processOrderObject.billID = req.body.billID;
        // for (let index in req.body) {
        //
        //     if (!tools.isEmpty(req.body[index])) {
        //
        //         processOrderObject[index] = req.body[index];
        //     }
        // }
        await processOrderObject.save();
        chargeBill = await chargeBillModel.findOneAndUpdate({billID: req.body.billID},
            {
                $set: {
                    processOrder: processOrderObject,
                    dealState: 1,
                    typeState: 1
                }
            }, {new: true});


        if (parseInt(chargeBill.RMBAmount) !== parseInt(req.body.chargeAmount)) {

            return res.status(400).json({error_msg: `RMBAmount input wrong`, error_code: "400"});
        }


        let myDate = new Date();
        let userResult;
        let myEvent = new myEventModel();

        if (chargeBill.typeStr === `R幣儲值`) {
            myEvent.eventType = `Rcoin`;
            myEvent.behavior = `Rcoin recharge`;
            myEvent.pointChange = 1;
            myEvent.amount = chargeBill.RMBAmount; //也许需要加密
            let rcoins = parseInt(req.user.Rcoins) + parseInt(chargeBill.RMBAmount);

            userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
                $inc: {growthPoints: 1},
                $push: {whatHappenedToMe: myEvent},
                $set: {Rcoins: tools.encrypt(rcoins)}
            }, {new: true});

        } else if (chargeBill.typeStr === `支付寶儲值` &&
            chargeBill.is_firstOrder === true &&
            chargeBill.rechargeInfo.rechargeAccountType === "Alipay") {
            myEvent.eventType = `Alipay`;
            myEvent.pointChange = 10;
            myEvent.amount = chargeBill.RMBAmount;
            myEvent.behavior = `first Alipay recharge`;
            userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
                $inc: {growthPoints: 10},
                $push: {whatHappenedToMe: myEvent},
                $set: {"userStatus.isFirstAlipayCharge": true}
            }, {new: true});

        } else if (chargeBill.typeStr === `微信錢包儲值` &&
            chargeBill.is_firstOrder === true &&
            chargeBill.rechargeInfo.rechargeAccountType === "Wechat") {
            myEvent.eventType = `Wechat`;
            myEvent.pointChange = 10;
            myEvent.amount = chargeBill.RMBAmount;
            myEvent.behavior = `first Wechat recharge`;
            userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
                $inc: {growthPoints: 10},
                $push: {whatHappenedToMe: myEvent},
                $set: {"userStatus.isFirstWechatCharge": true}
            }, {new: true});
        }
        else {
            userResult = await userModel.findOne({uuid: chargeBill.userUUid});
        }


        let referrerShareEvent = {
            eventType: `share growthPoint`,
            //content: `xxx`,
            pointChange: 10,
            amount: chargeBill.RMBAmount,
            behavior: `referrals consumption`,
            referralsUUID: chargeBill.userUUid
        };

        if (!tools.isEmpty(userResult.referrer) && !tools.isEmpty(userResult.referrer.referrerUUID)) {

            await userModel.findOneAndUpdate({uuid: userResult.referrer.referrerUUID}, {
                $inc: {growthPoints: 10}, $push: {whatHappenedToMe: referrerShareEvent}
            }, {new: true});//日子

        }

        await dataAnalystModel.findOneAndUpdate({
            dateClock: new Date(`${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`),
            itemWebType: chargeBill.typeStr
        }, {$inc: {count: 1, amount: chargeBill.RMBAmount}}, {new: true, upsert: true});

        logger.warn("addProcessOrderForRcoinCharge", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });

        return res.status(200).json({error_msg: `OK`, error_code: "0", data: chargeBill});
    }
    catch (err) {

        logger.error("addProcessOrderForRcoinCharge", {
            level: req.user.role,
            response: `addProcessOrderForRcoinCharge Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error_massage: err
        });
        return res.status(500).json({error_msg: `addProcessOrderForRcoinCharge Failed`, error_code: "500"});
    }
};