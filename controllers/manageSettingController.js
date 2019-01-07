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

    managerConfigsObject.feeRate = !isEmpty(req.body.feeRate) ? req.body.feeRate : billResult.feeRate;
    managerConfigsObject.L1_Issue = !isEmpty(req.body.L1_Issue) ? req.body.L1_Issue : billResult.L1_Issue;
    managerConfigsObject.L2_Issue = !isEmpty(req.body.L2_Issue) ? req.body.L2_Issue : billResult.L2_Issue;
    managerConfigsObject.L3_Issue = !isEmpty(req.body.L3_Issue) ? req.body.L3_Issue : billResult.L3_Issue;
    managerConfigsObject.friendAccount = !isEmpty(req.body.friendAccount) ? req.body.friendAccount : billResult.friendAccount;

    logger.info(`设置系统数据`, {req: req});
    managerConfigsObject.save((err) => {

        if (err) {
            logger.error(`设置系统数据`, {req: req, error: err.message});
            return res.status(503).send({error_code: 503, error_msg: 'NO'});
        } else {
            logger.warn(`checkConfirmationEmail`, {req: req});
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
            logger.error(`setModel`, {req: req, error: err.message});

            return res.status(503).send({error_code: 503, error_msg: 'NO'});
        }

        logger.info("setModel", {
            req: req
        });
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: err});
    });

};


exports.set3L = async (req, res) => {

    try {

        let operator = {sort: {created_at: -1}, limit: 1};
        let billResult;
        billResult = await managerConfigsModel.findOne({}, {_id: 0, __v: 0}, operator);


        let new_L1_Issue = billResult.L1_Issue;

        if (!isEmpty(req.body.L1_Issue)) {
            new_L1_Issue = [];
            for (let issue of billResult.L1_Issue) {

                if (issue.L1 === req.body.L1_Issue.L1) {

                    new_L1_Issue.push({L1: issue.L1, description: req.body.L1_Issue.description})

                } else {

                    new_L1_Issue.push(issue);

                }

            }
        }


        let new_L2_Issue = billResult.L2_Issue;

        if (!isEmpty(req.body.L2_Issue)) {
            new_L2_Issue = [];
            for (let issue of billResult.L2_Issue) {

                if (issue.L1 === req.body.L2_Issue.L1 && issue.L2 === req.body.L2_Issue.L2) {

                    new_L2_Issue.push({L1: issue.L1, L2: issue.L2, description: req.body.L2_Issue.description})

                } else {

                    new_L2_Issue.push(issue);

                }

            }
        }
        let new_L3_Issue = billResult.L3_Issue;
        if (!isEmpty(req.body.L3_Issue)) {
            new_L3_Issue = [];
            for (let issue of billResult.L3_Issue) {

                if (issue.L2 === req.body.L3_Issue.L2 && issue.L3 === req.body.L3_Issue.L3) {

                    new_L3_Issue.push({description: req.body.L3_Issue.description, L2: issue.L2, L3: issue.L3})

                } else {

                    new_L3_Issue.push(issue);

                }

            }
        }


        billResult.L3_Issue = new_L3_Issue;
        billResult.L2_Issue = new_L2_Issue;
        billResult.L1_Issue = new_L1_Issue;

        let myDate = new Date();
        billResult.created_at = myDate;
        billResult.updated_at = myDate;

        let managerConfigsEntity = new managerConfigsModel();
        billResult._id = managerConfigsEntity._id;
        await managerConfigsModel.updateOne({_id: billResult._id}, {$set: billResult}, {upsert: true, new: true});

        logger.warn("set3L", {
            req: req
        });
        return res.status(200).send({
            error_code: 0,
            error_msg: 'NO',
            data: {
                L1_Issue: new_L1_Issue,
                L2_Issue: new_L2_Issue,
                L3_Issue: new_L3_Issue
            }
        });

    } catch (err) {

        logger.error(`set3L`, {req: req, error: err.message});

        return res.status(503).send({error_code: 503, error_msg: 'NO'});
    }

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
        logger.error(`find3L`, {req: req, error: err.message});
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

        logger.error(`findCurrentSetting`, {error: err.message});

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

        logger.error(`getSetting`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: 'NO'});
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
        logger.error(`getAppealTopics`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: 'Error happened'});

    }


};

exports.addBankAccounts = async (req, res) => {

    try {
        let bankAccount = new bankAccountModel();

        for (let condition in req.body) {
            bankAccount[condition] = req.body[condition];
        }

        await bankAccount.save();

        logger.warn("addBankAccounts", {
            req: req
        });
        return res.status(200).send({error_code: 0, error_msg: 'NO', data: bankAccount});
    } catch (err) {
        logger.error(`addBankAccounts`, {req: req, error: err.message});
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

        logger.error(`getBankAccounts`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: 'Error happened'});

    }

};
//获取银行列表
exports.dujiuxing = async (req, res) => {
    return res.status(200).json({

        "error_code": 0,
        "data": {
            "bank": [
                {"value": "004", "label": "004 台灣銀行"},
                {"value": "005", "label": "005 土地銀行"},
                {"value": "006", "label": "006 合作金庫"},
                {"value": "007", "label": "007 第一銀行"},
                {"value": "008", "label": "008 華南銀行"},
                {"value": "009", "label": "009 彰化銀行"},
                {"value": "011", "label": "011 上海銀行"},
                {"value": "012", "label": "012 台北富邦銀行"},
                {"value": "013", "label": "013 國泰世華銀行"},
                {"value": "016", "label": "016 高雄銀行"},
                {"value": "017", "label": "017 兆豐商銀"},
                {"value": "020", "label": "020 瑞實銀行"},
                {"value": "021", "label": "021 花旗"},
                {"value": "025", "label": "025 首都銀行"},
                {"value": "039", "label": "039 澳商澳盛"},
                {"value": "048", "label": "048 王道商業銀行"},
                {"value": "050", "label": "050 台灣企銀"},
                {"value": "052", "label": "052 渣打銀行"},
                {"value": "053", "label": "053 台中商銀"},
                {"value": "054", "label": "054 京城商銀"},
                {"value": "056", "label": "056 花蓮企銀"},
                {"value": "057", "label": "057 臺東企銀"},
                {"value": "073", "label": "073 日聯銀行"},
                {"value": "081", "label": "081 匯豐商銀"},
                {"value": "083", "label": "083 英商渣打"},
                {"value": "101", "label": "101 大台北商銀"},
                {"value": "102", "label": "102 華泰商行"},
                {"value": "103", "label": "103 台灣新光"},
                {"value": "108", "label": "108 陽信商銀"},
                {"value": "118", "label": "118 板信商銀"},
                {"value": "803", "label": "803 聯邦商銀"},
                {"value": "804", "label": "804 匯豐中"},
                {"value": "805", "label": "805 遠東商銀"},
                {"value": "806", "label": "806 元大商銀"},
                {"value": "807", "label": "807 永豐商銀"},
                {"value": "808", "label": "808 玉山商銀"},
                {"value": "809", "label": "809 凱基銀行"},
                {"value": "810", "label": "810 星展寶銀行"},
                {"value": "812", "label": "812 台新商銀"},
                {"value": "814", "label": "814 大眾商銀"},
                {"value": "815", "label": "815 日盛商銀"},
                {"value": "816", "label": "816 安泰商銀"},
                {"value": "822", "label": "822 中國信託"}
            ],

            "postOffice": [
                {"value": "700", "label": "700 郵局"}
            ],
            "cooperative": [
                {"value": "104", "label": "104 台北五信"},
                {"value": "106", "label": "106 台北九信"},
                {"value": "114", "label": "114 基隆一信"},
                {"value": "115", "label": "115 基隆二信"},
                {"value": "119", "label": "119 淡水一信"},
                {"value": "120", "label": "120 淡水信用"},
                {"value": "124", "label": "124 宜蘭信用"},
                {"value": "127", "label": "127 桃園信用"},
                {"value": "130", "label": "130 新竹一信"},
                {"value": "132", "label": "132 新竹三信"},
                {"value": "133", "label": "133 新竹五信"},
                {"value": "135", "label": "135 新竹十信"},
                {"value": "139", "label": "139 竹南信用"},
                {"value": "146", "label": "146 台中二信"},
                {"value": "147", "label": "147 三信銀行"},
                {"value": "158", "label": "158 彰化一信"},
                {"value": "161", "label": "161 彰化五信"},
                {"value": "162", "label": "162 彰化六信"},
                {"value": "163", "label": "163 彰化十信"},
                {"value": "165", "label": "165 鹿港信用"},
                {"value": "172", "label": "172 斗六信用"},
                {"value": "176", "label": "176 嘉義一信"},
                {"value": "178", "label": "178 嘉義三信"},
                {"value": "179", "label": "179 嘉義四信"},
                {"value": "183", "label": "183 新營信用"},
                {"value": "188", "label": "188 台南三信"},
                {"value": "190", "label": "190 台南五信"},
                {"value": "191", "label": "191 台南六信"},
                {"value": "198", "label": "198 鳳山信用"},
                {"value": "203", "label": "203 高雄二信"},
                {"value": "204", "label": "204 高雄三信"},
                {"value": "215", "label": "215 花蓮一信"},
                {"value": "216", "label": "216 花蓮二信"},
                {"value": "219", "label": "219 東市信用"},
                {"value": "222", "label": "222 澎湖一信"},
                {"value": "223", "label": "223 澎湖二信"},
                {"value": "224", "label": "224 金門信用"}
            ],

            "association": [
                {"value": "600", "label": "600 農金資中心"},
                {"value": "603", "label": "603 基隆市農會"},
                {"value": "605", "label": "605 高雄市農會"},
                {"value": "606", "label": "606 台北縣農會"},
                {"value": "607", "label": "607 宜蘭縣農會"},
                {"value": "608", "label": "608 桃園縣農會"},
                {"value": "610", "label": "610 新竹縣農會"},
                {"value": "611", "label": "611 苗栗縣農會"},
                {"value": "613", "label": "613 南投縣農會"},
                {"value": "614", "label": "614 彰化縣農會"},
                {"value": "616", "label": "616 雲林縣農會"},
                {"value": "617", "label": "617 嘉義縣農會"},
                {"value": "618", "label": "618 台南縣農會"},
                {"value": "619", "label": "619 高雄縣農會"},
                {"value": "620", "label": "620 屏東縣農會"},
                {"value": "621", "label": "621 花蓮縣農會"},
                {"value": "622", "label": "622 台東縣農會"},
                {"value": "623", "label": "623 台北市農會"},
                {"value": "624", "label": "624 澎湖縣農會"},
                {"value": "625", "label": "625 台中市農會"},
                {"value": "627", "label": "627 連江縣農會"},
                {"value": "901", "label": "901 大里農會"},
                {"value": "903", "label": "903 汐止農會"},
                {"value": "904", "label": "904 新莊農會"},
                {"value": "905", "label": "905 九如農會"},
                {"value": "908", "label": "908 玉井農會"},
                {"value": "910", "label": "910 寶山農會"},
                {"value": "911", "label": "911 松農"},
                {"value": "912", "label": "912 冬農"},
                {"value": "916", "label": "916 草屯農會"},
                {"value": "918", "label": "918 東勢農會"},
                {"value": "919", "label": "919 沙鹿農會"},
                {"value": "922", "label": "922 台南市農會"},
                {"value": "925", "label": "925 竹山農會"},
                {"value": "928", "label": "928 板橋農會"},
                {"value": "951", "label": "951 北投農會"},
                {"value": "954", "label": "954 中農中心"},
                {"value": "955", "label": "955 竹南農會"}

            ],

            "fishing": [
                {"value": "503", "label": "503 基隆漁會"},
                {"value": "504", "label": "504 瑞芳漁會"},
                {"value": "505", "label": "505 蘇澳漁會"},
                {"value": "506", "label": "506 桃園漁會"},
                {"value": "507", "label": "507 新竹漁會"},
                {"value": "512", "label": "512 雲林漁會"},
                {"value": "515", "label": "515 嘉義漁會"},
                {"value": "517", "label": "517 台南市漁會"},
                {"value": "518", "label": "518 台南縣漁會"},
                {"value": "520", "label": "520 小港漁會"},
                {"value": "521", "label": "521 興達港漁會"},
                {"value": "523", "label": "523 屏東縣漁會"},
                {"value": "524", "label": "524 新港區漁會"},
                {"value": "525", "label": "525 澎湖漁會"}
            ]
        }

    });


};
exports.findCurrentSetting = findCurrentSetting;