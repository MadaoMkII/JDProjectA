const processOrderModel = require('../modules/processOrder').processOrderModel;
const myEventModel = require('../modules/userAccount').myEventModel;
const dgBillModel = require('../modules/dgBill').dgBillModel;
const chargeBillModel = require('../modules/chargeBill').chargeBillModel;
const tools = require('../config/tools');
const picController = require('../controllers/picController');
const userModel = require('../modules/userAccount').userAccountModel;
const dataAnalystModel = require('../modules/dataAnalyst').dataAnalystModel;

exports.getDataAnalyst = async (req, res) => {
    try {
        let searchConditions = {};
        for (let index in req.body) {
            if (!tools.isEmpty(req.body[index])) {
                searchConditions[index] = req.body[index];
            }
        }
        delete searchConditions[`beforeDate`];
        delete searchConditions[`afterDate`];
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
        resultMap.set(`天猫淘宝代付`, {"totalAmount": 0, "count": 0,});
        resultMap.set(`阿里巴巴代付`, {"totalAmount": 0, "count": 0,});
        resultMap.set(`支付宝充值`, {"totalAmount": 0, "count": 0,});
        resultMap.set(`微信充值`, {"totalAmount": 0, "count": 0,});
        resultMap.set(`代购`, {"totalAmount": 0, "count": 0,});
        for (let resultEntityKey of result) {
            resultMap.set(resultEntityKey.itemWebType,
                {"totalAmount": resultEntityKey.totalAmount, "count": resultEntityKey.count});

        }
        let lastResult = [];
        resultMap.forEach((value, key) => {

            lastResult.push({itemWebType: key, count: value.count, totalAmount: value.totalAmount});
        });
        //let result = await dataAnalystModel.find(searchConditions, {}, {"group": `itemWebType`});
        return res.status(200).json({error_msg: 'ok', error_code: "0", data: lastResult});
    } catch (e) {
        console.log(e)
        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};


exports.addProcessOrder = async (req, res) => {

    try {

        const [returnReq] = await picController.uploadImgAsyncArray(req, res);
        let processOrderObject = new processOrderModel();

        if (tools.isEmpty(req.body[`billID`])) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }

        for (let img of returnReq.files) {
            processOrderObject.imageFilesNames.push(img.filename);
        }


        processOrderObject.chargeDate = new Date();

        for (let index in req.body) {

            if (!tools.isEmpty(req.body[index])) {

                processOrderObject[index] = req.body[index];
            }
        }
        await processOrderObject.save();


        let dgBillEntity = await dgBillModel.findOneAndUpdate({billID: req.body.billID},
            {$set: {processOrder: processOrderObject._id}}, {new: true}).populate(`processOrder`);


        let userResult;

        if (dgBillEntity.typeStr === `其他支付方式代付` &&
            dgBillEntity.is_firstOrder === true &&
            dgBillEntity.paymentInfo.paymentMethod === "Alipay") {
            let tempEvent = new myEventModel();
            tempEvent.eventType = `growthPoint`;
            tempEvent.amount = dgBillEntity.RMBAmount;
            tempEvent.amount = 10;
            tempEvent.behavior = `first Alipay consumption`;

            userResult = await userModel.findOneAndUpdate({uuid: dgBillEntity.userUUid}, {
                $inc: {growthPoints: 10},
                $push: {whatHappenedToMe: tempEvent},
                $set: {"userStatus.isFirstTimePaid": true}
            }, {new: true});
        } else {
            let tempEvent = new myEventModel();
            tempEvent.eventType = `growthPoint`;
            tempEvent.amount = 1;
            tempEvent.behavior = `consumption`;
            userResult = await userModel.findOneAndUpdate({uuid: dgBillEntity.userUUid}, {
                $inc: {growthPoints: 1},
                $push: {whatHappenedToMe: tempEvent}
            }, {new: true});

        }

        let giveThemMyEvent = new myEventModel();
        giveThemMyEvent.eventType = `growthPoint`;
        giveThemMyEvent.amount = 10;
        giveThemMyEvent.referralsUUID = dgBillEntity.userUUid;
        //content: `xxx`,

        if (!tools.isEmpty(userResult.referrer) && !tools.isEmpty(userResult.referrer.referrerUUID)) {
            await userModel.findOneAndUpdate({uuid: userResult.referrer.referrerUUID}, {
                $inc: {growthPoints: 10}, $push: {whatHappenedToMe: giveThemMyEvent}
            }, {new: true});//日子

        }
        let myDate = new Date();

        await dataAnalystModel.findOneAndUpdate({
            dateClock: new Date(`${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`),
            itemWebType: dgBillEntity.itemInfo.itemWebType
        }, {$inc: {count: 1, amount: dgBillEntity.NtdAmount}}, {new: true, upsert: true});

        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    }
    catch (e) {

        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};

exports.addProcessOrderForRcoinCharge = async (req, res) => {


    try {

        const [returnReq] = await picController.uploadImgAsyncArray(req, res);
        let processOrderObject = new processOrderModel();

        if (tools.isEmpty(req.body[`billID`])) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }

        for (let img of returnReq.files) {
            processOrderObject.imageFilesNames.push(img.filename);
        }


        processOrderObject.chargeDate = new Date();

        for (let index in req.body) {

            if (!tools.isEmpty(req.body[index])) {

                processOrderObject[index] = req.body[index];
            }
        }
        await processOrderObject.save();
        let chargeBill = await chargeBillModel.findOneAndUpdate({billID: req.body.billID},
            {
                $set: {
                    processOrder: processOrderObject._id,
                    dealState: 1,
                    typeState: 1
                }
            }, {new: true}).populate(`processOrder`);


        if (parseInt(chargeBill.RMBAmount) !== parseInt(req.body.chargeAmount)) {

            return res.status(400).json({error_msg: `RMBAmount input wrong`, error_code: "400"});
        }


        let myDate = new Date();
        let userResult;
        let myEvent = new myEventModel();
        myEvent.eventType = `Rcoin`;
        myEvent.behavior = `recharge`;
        myEvent.amount = chargeBill.RMBAmount;

        let rcoins = parseInt(req.user.Rcoins) + parseInt(chargeBill.RMBAmount);

        userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
            $inc: {growthPoints: 1},
            $push: {whatHappenedToMe: myEvent},
            $set: {Rcoins: tools.encrypt(rcoins)}
        }, {new: true});
        req.user = userResult;

//以下要细分
//         if (chargeBill.typeStr === `账户代充` &&
//             chargeBill.is_firstOrder === false &&
//             chargeBill.rechargeInfo.rechargeAccountType === "Alipay") {
//             myEvent.amount = 10;
//             myEvent.behavior = `first Alipay consumption`;
//             userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
//                 $inc: {growthPoints: 10},
//                 $push: {whatHappenedToMe: myEvent},
//                 $set: {"userStatus.isFirstAlipayCharge": true}
//             }, {new: true});
//         } else {
//             myEvent.amount = 1;
//             myEvent.behavior = `consumption`;
//             userResult = await userModel.findOneAndUpdate({uuid: chargeBill.userUUid}, {
//                 $inc: {growthPoints: 1},
//                 $push: {whatHappenedToMe: myEvent}
//             }, {new: true});
//
//         }

        // let giveThemMyEvent = {
        //     eventType: `growthPoint`,
        //     //content: `xxx`,
        //     amount: 10,
        //     behavior: `referrals consumption`,
        //     referralsUUID: chargeBill.userUUid
        // };
        // if (!tools.isEmpty(userResult.referrer) && !tools.isEmpty(userResult.referrer.referrerUUID)) {
        //     for (let index of  userResult.referrer.referrerUUID) {
        //         await userModel.findOneAndUpdate({uuid: index}, {
        //             $inc: {growthPoints: 10}, $push: {whatHappenedToMe: giveThemMyEvent}
        //         }, {new: true});//日子
        //     }
        // }


        let dataAnalyst = await dataAnalystModel.findOneAndUpdate({
            dateClock: new Date(`${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`),
            itemWebType: `Rcoin recharge`
        }, {$inc: {count: 1, amount: chargeBill.RMBAmount}}, {new: true, upsert: true});
        console.log(dataAnalyst)
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: chargeBill});
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};