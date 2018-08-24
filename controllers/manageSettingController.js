const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;


exports.setSetting = async (req, res) => {


    let compare = (pro) => {

        return function (obj1, obj2) {
            let val1 = obj1[pro];
            let val2 = obj2[pro];
            if (val1 < val2) { //正序
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
    };

    let billResult = await findCurrentSetting();
    let managerConfigsObject = new managerConfigsModel();
    console.log(billResult)

    managerConfigsObject.RcoinRate = req.body.RcoinRate ? req.body.RcoinRate : billResult.RcoinRate;
    managerConfigsObject.RcoinRate.sort(compare('beginAmount'));


    managerConfigsObject.PaymentPlatformRate = req.body.PaymentPlatformRate ?
        req.body.PaymentPlatformRate : billResult.PaymentPlatformRate;
    managerConfigsObject.PaymentPlatformRate.sort(compare('beginAmount'));

    managerConfigsObject.aliPayAccounts = req.body.aliPayAccounts ? req.body.aliPayAccounts : billResult.aliPayAccounts;

    managerConfigsObject.threshold.platform = req.body.threshold.platform ? req.body.threshold.platform : billResult.threshold.platform;
    managerConfigsObject.threshold.alipay = req.body.threshold.alipay ? req.body.threshold.alipay : billResult.threshold.alipay;
    managerConfigsObject.threshold.wechat = req.body.threshold.wechat ? req.body.threshold.wechat : billResult.threshold.wechat;
    managerConfigsObject.feeRate = req.body.feeRate;

    console.log("\033[40;32m" + managerConfigsObject)
    managerConfigsObject.save((err) => {

        if (err) {
            console.log(err);
            return res.status(400).send({error_code: 400, error_msg: 'NO'});
        } else {
            return res.status(200).send({error_code: 0, error_msg: 'OK'});
        }

    });


};


let findCurrentSetting = async () => {
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
        console.log(result.RcoinRate[0].beginAmount)
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: result});
    } catch (err) {
        console.log(err);
        return res.status(400).send({error_code: 400, error_msg: 'NO'});

    }


};


exports.findCurrentSetting = findCurrentSetting;