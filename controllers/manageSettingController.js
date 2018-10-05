const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;
const bankAccountModel = require('../modules/bankAccount').bankAccountModel;
const isEmpty = require('../config/tools').isEmpty;
const compare = require('../config/tools').compare;
exports.setSetting = async (req, res) => {


    let billResult = await findCurrentSetting();
    let managerConfigsObject = new managerConfigsModel();
    managerConfigsObject.RcoinRate = !isEmpty(req.body.RcoinRate) ? req.body.RcoinRate : billResult.RcoinRate;
    managerConfigsObject.RcoinRate.sort(compare('beginAmount'));
console.log(isEmpty(req.body.AlipayAndWechatRate))

    managerConfigsObject.AlipayAndWechatRate = !isEmpty(req.body.AlipayAndWechatRate) ?
        req.body.AlipayAndWechatRate : billResult.AlipayAndWechatRate;
    managerConfigsObject.AlipayAndWechatRate.sort(compare('beginAmount'));

    managerConfigsObject.aliPayAccounts = !isEmpty(req.body.aliPayAccounts) ? req.body.aliPayAccounts : billResult.aliPayAccounts;
    if (!isEmpty(req.body.threshold)) {
        managerConfigsObject.threshold.platform = !isEmpty(req.body.threshold.platform) ?
            req.body.threshold.platform : billResult.threshold.platform;
        managerConfigsObject.threshold.alipay = !isEmpty(req.body.threshold.alipay) ?
            req.body.threshold.alipay : billResult.threshold.alipay;
        managerConfigsObject.threshold.wechat = !isEmpty(req.body.threshold.wechat) ?
            req.body.threshold.wechat : billResult.threshold.wechat;
    } else {

        managerConfigsObject.threshold.platform = billResult.threshold.platform;
        managerConfigsObject.threshold.alipay = billResult.threshold.alipay;
        managerConfigsObject.threshold.wechat = billResult.threshold.wechat;

    }

    managerConfigsObject.models = !isEmpty(req.body.models) ? req.body.models : billResult.models;
    managerConfigsObject.feeRate = !isEmpty(req.body.feeRate) ? req.body.feeRate : billResult.feeRate;
    managerConfigsObject.L1_Issue = !isEmpty(req.body.L1_Issue) ? req.body.L1_Issue : billResult.L1_Issue;
    managerConfigsObject.L2_Issue = !isEmpty(req.body.L2_Issue) ? req.body.L2_Issue : billResult.L2_Issue;
    managerConfigsObject.L3_Issue = !isEmpty(req.body.L3_Issue) ? req.body.L3_Issue : billResult.L3_Issue;

    //console.log("\033[40;32m" + managerConfigsObject)
    managerConfigsObject.save((err) => {

        if (err) {
            console.log(err);
            return res.status(400).send({error_code: 400, error_msg: 'NO'});
        } else {
            return res.status(200).send({error_code: 0, error_msg: 'OK'});
        }

    });
};


exports.setModel = async (req, res) => {

    let modelsArray = req.body.models;
    managerConfigsModel.findOneAndUpdate({}, {sort: {created_at: 1}}, {
        update: {$set: {models: modelsArray}}

    }, (err) => {

        return res.status(200).send({error_code: 0, error_msg: 'NO', data: err});
    });

};

const findCurrentSetting = async () => {

    try {
        let operator = {sort: {created_at: -1}, limit: 1};
        let billResult;
        billResult = await managerConfigsModel.findOne(null, {
            __v: 0,
            _id: 0
        }, operator);

        return billResult;
    } catch (e) {

    }

};

exports.getSetting = async (req, res) => {

    try {
        let resResult = {};
        let result = await findCurrentSetting();
        if (!isEmpty(req.body[`conditions`])) {
            for (let condition of req.body[`conditions`]) {

                resResult[condition] = result[condition];
            }
        } else {
            resResult = result;
        }
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: resResult});
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({error_code: 400, error_msg: 'NO'});
    }

};

exports.getAppealTopics = async (req, res) => {

    try {
        let result = await findCurrentSetting();
        let responseResult = {};
        responseResult.L1_Issue = result.L1_Issue;
        responseResult.L2_Issue = result.L2_Issue;
        responseResult.L3_Issue = result.L3_Issue;

        return res.status(200).send({error_code: 0, error_msg: 'NO', data: responseResult});
    } catch (err) {
        console.log(err);
        return res.status(400).send({error_code: 400, error_msg: 'Error happened'});

    }


};

exports.addBankAccounts = async (req, res) => {

    try {
        let bankAccount = new bankAccountModel();

        for (let condition in req.body) {
            bankAccount[condition] = req.body[condition];
        }

        bankAccount.save();
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: bankAccount});
    } catch (err) {
        console.log(err);
        return res.status(400).send({error_code: 400, error_msg: 'Error happened'});

    }
};
exports.getBankAccounts = async (req, res) => {

    try {
        // let searchCommand = {};
        //
        // for (let condition in req.body) {
        //     if (!isEmpty(req.body[condition])) {
        //         searchCommand[condition] = req.body[condition];
        //     }
        // }

        // let operator = {};
        // if (isEmpty(req.body['page']) && !isEmpty(req.body['unit'])) {
        //     operator.skip = (parseInt(req.body['page']) - 1) * parseInt(req.body['unit']);
        //     operator.limit = parseInt(req.body['unit']);
        // }

        let result = await bankAccountModel.find();
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: result});
    } catch (err) {
        console.log(err)
        return res.status(400).send({error_code: 400, error_msg: 'Error happened'});

    }

};
exports.findCurrentSetting = findCurrentSetting;