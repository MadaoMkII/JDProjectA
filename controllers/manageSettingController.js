const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;
const bankAccountModel = require('../modules/bankAccount').bankAccountModel;
const isEmpty = require('../config/tools').isEmpty;
const compare = require('../config/tools').compare;
const logger = require('../logging/logging').logger;


exports.setSetting = async (req, res) => {


    let billResult = await findCurrentSetting();
    let managerConfigsObject = new managerConfigsModel();
    managerConfigsObject.RcoinRate = !isEmpty(req.body.RcoinRate) ? req.body.RcoinRate : billResult.RcoinRate;
    managerConfigsObject.RcoinRate.sort(compare('beginAmount'));

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
    managerConfigsObject.rate = !isEmpty(req.body.rate) ? req.body.rate : billResult.rate;
    managerConfigsObject.L1_Issue = !isEmpty(req.body.L1_Issue) ? req.body.L1_Issue : billResult.L1_Issue;
    managerConfigsObject.L2_Issue = !isEmpty(req.body.L2_Issue) ? req.body.L2_Issue : billResult.L2_Issue;
    managerConfigsObject.L3_Issue = !isEmpty(req.body.L3_Issue) ? req.body.L3_Issue : billResult.L3_Issue;


    logger.info("setSetting", {
        level: req.user.role,
        user: req.user.uuid,
        email: req.user.email_address,
        location: (new Error().stack).split("at ")[1],
        body: req.body
    });

    managerConfigsObject.save((err) => {

        if (err) {
            logger.error("setSetting", {
                level: req.user.role,
                response: `setSetting Failed`,
                user: req.user.uuid,
                email: req.user.email_address,
                location: (new Error().stack).split("at ")[1],
                body: req.body,
                error: err
            });


            return res.status(500).send({error_code: 500, error_msg: 'NO'});
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

        if (err) {
            logger.error("setModel", {
                level: req.user.role,
                response: `setModel`,
                user: req.user.uuid,
                email: req.user.email_address,
                location: (new Error().stack).split("at ")[1],
                body: req.body,
                error: err
            });

            return res.status(500).send({error_code: 500, error_msg: 'NO'});
        }

        logger.info("setSetting", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });

        return res.status(200).send({error_code: 0, error_msg: 'NO', data: err});
    });

};
exports.find3L = async (req, res) => {

    try {
        let operator = {sort: {created_at: -1}, limit: 1};
        let billResult;
        billResult = await managerConfigsModel.findOne(null, {
            L1_Issue: 1, L2_Issue: 1,
            L3_Issue: 1, _id: 0
        }, operator);

        return res.status(200).send({error_code: 0, error_msg: 'NO', data: billResult});

    } catch (err) {
        logger.error("find3L", {
            level: req.user.role,
            response: `find3L Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });

        return res.status(500).send({error_code: 500, error_msg: 'NO'});
    }

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
    } catch (err) {

        logger.error("findCurrentSetting", {
            response: `find3L Failed`,
            location: (new Error().stack).split("at ")[1],
            error: err
        });

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

        logger.error("getSetting", {
            response: `getSetting`,
            location: (new Error().stack).split("at ")[1],
            error: err
        });
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
        logger.error("getAppealTopics", {
            response: `getAppealTopics`,
            location: (new Error().stack).split("at ")[1],
            error: err
        });
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

        logger.info("addBankAccounts", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: bankAccount});
    } catch (err) {
        logger.error("addBankAccounts", {
            level: req.user.role,
            response: `addBankAccounts Failed`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
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

        logger.error("getBankAccounts", {
            level: req.user.role,
            response: `getBankAccounts`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(400).send({error_code: 400, error_msg: 'Error happened'});

    }

};
exports.findCurrentSetting = findCurrentSetting;