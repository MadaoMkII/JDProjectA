const dgBillModel = require('../modules/dgBill').dgBillModel;
//const logger = require('../logging/logger');
const userModel = require('../modules/userAccount').userAccountModel;
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');

exports.addDGByALIBill = async (req, res) => {

    try {
        if (req.user.Rcoins < req.body.itemInfo.itemPrice) {
            return res.status(200).send({error_code: 513, error_msg: '要不起'});
        }
        const managerConfig = await manageSettingController.findCurrentSetting();

        let rateObject = {};
        for (let rateInfoEntity of managerConfig.PaymentPlatformRate) {

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

        let billObject = new dgBillModel();
        billObject.typeStr = '支付宝代购';
        billObject.billID = 'ALDG' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.NtdAmount = req.body.RMBAmount * rate;
        billObject.rate = rate;
        billObject.paymentInfo = {};
        billObject.paymentInfo.paymentMethod = 'Alipay';
        billObject.paymentInfo.paymentDFAccount = req.body.paymentInfo.paymentDFAccount;
        billObject.paymentInfo.friendAlipayAccount = req.body.paymentInfo.friendAlipayAccount;
        billObject.itemInfo = {};
        billObject.itemInfo.itemName = req.body.itemInfo.itemName;
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        billObject.fee = managerConfig.feeRate * req.body.RMBAmount * rate;
        await billObject.save();

        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (e) {
        console.log(e)
        return res.status(513).send({error_code: 513, error_msg: e});
    }
};
exports.addDGRcoinsBill = async (req, res) => {

    try {
        if (!req.user.Rcoins || !req.body.itemInfo.itemPrice ||
            Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.itemInfo.itemPrice) < 0) {
            return res.status(200).send({error_code: 513, error_msg: '要不起'});
        }
        const managerConfig = await manageSettingController.findCurrentSetting();
        let billObject = new dgBillModel();
        billObject.typeStr = '淘宝代付';
        billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
        //billObject.userUUid = req.user.uuid;
        billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.paymentInfo = {};
        billObject.paymentInfo.paymentMethod = 'Rcoin';
        billObject.itemInfo = {};
        billObject.itemInfo.itemName = req.body.itemInfo.itemName;
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        billObject.itemInfo.itemPrice = req.body.itemInfo.itemPrice;

        billObject.fee = managerConfig.feeRate * req.body.RMBAmount;
        //await billObject.save();
        let recentRcoins = Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.itemInfo.itemPrice);
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

// let searchPayBills = async (query) => {
//
//     try {
//         let accounts = await payingBillModel.findOne({comment:'你大爷'},{'_id':0,updated_at:0});
//
//         console.log(accounts) ;
//
//         mongoose.disconnect();
//     } catch (error) {
//
//         return {error}
//
//     }
//
//
// };
// searchPayBills(null).then();