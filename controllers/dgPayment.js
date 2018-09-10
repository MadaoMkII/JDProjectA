const dgBillModel = require('../modules/dgBill').dgBillModel;
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
            if (rateType !== `RcoinRate` && rateType !== `PaymentPlatformRate`) {
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
            resolve(rate);

        } catch (err) {
            reject(err);
        }
    });
};
exports.getThisUserRcoinRate = async (req, res) => {
    try {
        let rate = await getRate(req, res);

        return res.status(200).send({error_code: 0, error_msg: "OK", data: {rate: rate}});
    } catch (e) {
        return res.status(513).send({error_code: 513, error_msg: e});
    }

};


exports.addDGByALIBill = async (req, res) => {

    try {

        if (req.user.Rcoins < req.body.RMBAmount) {
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
        billObject.typeStr = '支付宝代付';
        billObject.billID = 'ALDF' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
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

        return res.status(513).send({error_code: 513, error_msg: e});
    }
};
exports.addDGRcoinsBill = async (req, res) => {

    try {
        let billObject = new dgBillModel();
        if (!req.user.Rcoins || !req.body.RMBAmount ||
            Number.parseInt(req.user.Rcoins) - Number.parseInt(req.body.RMBAmount) < 0) {
            return res.status(200).send({error_code: 513, error_msg: '要不起'});
        }
        if (req.body.typeStr === `R币代付`) {
            billObject.isVirtualItem = req.body.isVirtualItem;
            billObject.paymentInfo.friendAlipayAccount = req.body.paymentInfo.friendAlipayAccount;
            billObject.billID = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
        } else if (req.body.typeStr === `R币代购`) {
            billObject.isVirtualItem = null;
            billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
        } else {
            return res.status(403).send({error_code: 403, error_msg: 'typeStr has wrong value'});
        }
        const managerConfig = await manageSettingController.findCurrentSetting();

        let rateObject = {};

        for (let rateInfoEntity of managerConfig.RcoinRate) {

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

        billObject.RMBAmount = req.body.RMBAmount;
        billObject.userUUid = req.user.uuid;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.NtdAmount = req.body.RMBAmount * rate;
        billObject.rate = rate;

        billObject.paymentInfo.paymentMethod = 'Rcoin';

        billObject.itemInfo = {};
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        billObject.fee = managerConfig.feeRate * req.body.RMBAmount;
        let userObject = {};
        userObject.uuid = req.user.uuid;
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