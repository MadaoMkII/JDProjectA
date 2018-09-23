const processOrderModel = require('../modules/processOrder').processOrderModel;
const dgBillModel = require('../modules/dgBill').dgBillModel;
const isEmpty = require('../config/tools').isEmpty;
const picController = require('../controllers/picController');
const userModel = require('../modules/userAccount').userAccountModel;
const dataAnalystModel = require('../modules/dataAnalyst').dataAnalystModel;
exports.addProcessOrder = async (req, res) => {


    try {

        const [returnReq] = await picController.uploadImgAsyncArray(req, res);
        let processOrderObject = new processOrderModel();

        if (isEmpty(req.body[`billID`])) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }

        for (let img of returnReq.files) {
            processOrderObject.imageFilesNames.push(img.filename);
        }


        processOrderObject.chargeDate = new Date();

        for (let index in req.body) {

            if (!isEmpty(req.body[index])) {

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
        if (!isEmpty(userResult.referrer) && !isEmpty(userResult.referrer.referrerUUID)) {
            for (let index of  userResult.referrer.referrerUUID) {
                await userModel.findOneAndUpdate({uuid: index}, {
                    $inc: {growthPoints: 10}, $push: {whatHappenedToMe: giveThemMyEvent}
                }, {new: true});//日子
            }
        }
        let myDate = new Date();

        let dataAnalyst = await dataAnalystModel.findOneAndUpdate({
            year: myDate.getFullYear(),
            month: myDate.getMonth(),
            day: myDate.getDay()
        }, {$inc: {count: 1, amount: dgBillEntity.NtdAmount}}, {new: true, upsert: true});
        console.log(dataAnalyst)
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};
