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
        let result = await dataAnalystModel.find(searchConditions);
        return res.status(200).json({error_msg: 'ok', error_code: "0", data: result});
    } catch (e) {
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
        let myEvent = {
            eventType: `growthPoint`,
            //content: `xxx`,

        };
        let userResult;

        if (dgBillEntity.typeStr === `其他支付方式代付` &&
            dgBillEntity.is_firstOrder === true &&
            dgBillEntity.paymentInfo.paymentMethod === "Alipay") {
            myEvent.amount = 10;
            myEvent.behavior = `first Alipay consumption`;
            userResult = await userModel.findOneAndUpdate({uuid: dgBillEntity.userUUid}, {
                $inc: {growthPoints: 10},
                $push: {whatHappenedToMe: myEvent},
                $set: {"userStatus.isFirstTimePaid": true}
            }, {new: true});
        } else {
            myEvent.amount = 1;
            myEvent.behavior = `consumption`;
            userResult = await userModel.findOneAndUpdate({uuid: dgBillEntity.userUUid}, {
                $inc: {growthPoints: 1},
                $push: {whatHappenedToMe: myEvent}
            }, {new: true});

        }

        let giveThemMyEvent = {
            eventType: `growthPoint`,
            //content: `xxx`,
            amount: 10,
            behavior: `referrals consumption`,
            referralsUUID: dgBillEntity.userUUid
        };
        if (!tools.isEmpty(userResult.referrer) && !tools.isEmpty(userResult.referrer.referrerUUID)) {
            for (let index of  userResult.referrer.referrerUUID) {
                await userModel.findOneAndUpdate({uuid: index}, {
                    $inc: {growthPoints: 10}, $push: {whatHappenedToMe: giveThemMyEvent}
                }, {new: true});//日子
            }
        }
        let myDate = new Date();

        await dataAnalystModel.findOneAndUpdate({
            year: myDate.getFullYear(),
            month: myDate.getMonth() + 1,
            day: myDate.getDate(),
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
            $set: {Rcoins: rcoins}
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
            year: myDate.getFullYear(),
            month: myDate.getMonth() + 1,
            day: myDate.getDate(),
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