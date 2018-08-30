const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;
const isEmpty = require('../config/tools').isEmpty;
const compare = require('../config/tools').compare;
exports.setSetting = async (req, res) => {


    let billResult = await findCurrentSetting();
    let managerConfigsObject = new managerConfigsModel();
    managerConfigsObject.RcoinRate = !isEmpty(req.body.RcoinRate) ? req.body.RcoinRate : billResult.RcoinRate;
    managerConfigsObject.RcoinRate.sort(compare('beginAmount'));


    managerConfigsObject.PaymentPlatformRate = !isEmpty(req.body.PaymentPlatformRate) ?
        req.body.PaymentPlatformRate : billResult.PaymentPlatformRate;
    managerConfigsObject.PaymentPlatformRate.sort(compare('beginAmount'));

    managerConfigsObject.aliPayAccounts = !isEmpty(req.body.aliPayAccounts) ? req.body.aliPayAccounts : billResult.aliPayAccounts;

    managerConfigsObject.threshold.platform = !isEmpty(req.body.threshold.platform) ?
        req.body.threshold.platform : billResult.threshold.platform;
    managerConfigsObject.threshold.alipay = !isEmpty(req.body.threshold.alipay) ?
        req.body.threshold.alipay : billResult.threshold.alipay;
    managerConfigsObject.threshold.wechat = !isEmpty(req.body.threshold.wechat) ?
        req.body.threshold.wechat : billResult.threshold.wechat;
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


const findCurrentSetting = async () => {
    let operator = {sort: {created_at: -1}, limit: 1};
    let billResult;
    billResult = await managerConfigsModel.findOne(null, {
        __v: 0,
        _id: 0
    }, operator);

    return billResult;
};

exports.getSetting = async (req, res) => {
    try {
        let result = await findCurrentSetting();
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: result});
    } catch (err) {
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

exports.findCurrentSetting = findCurrentSetting;