const config = require('../config/develop');
let url = require("url");
let crypto = require("crypto");
//let qr = require('qr-image');
const request = require('request');
const userModel = require('../modules/userAccount').userAccountModel;
const tool = require('../config/tools');
const queryString = require("querystring");
const logger = require('../logging/logging').logger;
const tenpay = require('tenpay');
const searchModel = require('../controllers/searchModel');

const api_config = {
    appid: 'wx61ff88bc59103229',
    mchid: '1515806061',
    mch_id: '1515806061',
    partnerKey: 'wa5c1a8e6t4ybx65t3N13w2B15jf6A48',
    pfx: require('fs').readFileSync('./keys/apiclient_cert.p12'),
    notify_url: 'http://www.yubaopay.com.tw/receive'
    //spbill_create_ip: 'IP地址'
};
const api = new tenpay(api_config);


const transfers_func = async (openid, amount, order_ID, desc = `Yubao money transfer`) => {

    return await api.transfers({
        partner_trade_no: order_ID,
        openid: openid,//ocNtC1llqNtJG7aVGaV0uZ0yuhRI
        re_user_name: '假的名字',
        check_name: "FORCE_CHECK",//FORCE_CHECK NO_CHECK
        amount: amount,
        desc: desc
    });

};

exports.transfers_money = async (req, res) => {

    try {
        let requestEntity = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `openid`, "require": true},
            {"filedName": `amount`, "require": true}
        );
        let randomString = `YBWETF${Math.random().toString(36).substr(2).toUpperCase()}`;

        let result = await transfers_func(requestEntity[`openid`], requestEntity[`amount`], randomString);

    } catch (err) {
        logger.error(`微信转账`, {req: req, error: err.message});
        return res.status(500).json({error_msg: "code can not use ", error_code: "500"});
    }
};
let sha1 = (str) => {
    let md5sum = crypto.createHash("sha1");
    md5sum.update(str);
    str = md5sum.digest("hex");
    return str;
};

let requestFun = (JSONObject, method, url) => {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: method,
            json: true,   // <--Very important!!!
            body: JSONObject
        }, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                resolve([response, body]);
            }
        });
    });
};
// exports.getQR_code = async (req, res) => {
//
//     try {
//         let JSONObject = {
//             "expire_seconds": 60000,
//             "action_name": "QR_STR_SCENE",
//             "action_info": {"scene": {"scene_id": "002", "scene_str": req.user.uuid}}
//         };
//         let [, body] = await requestFun(JSONObject, "POST", config.qrcode_create_link + config.access_token);
//         if (body[`errcode`] === 42001) {
//             return res.status(405).json({error_msg: "access_token expired", error_code: "405"});
//         }
//
//         let img = qr.image(body.url, {size: 10});
//         res.writeHead(200, {'Content-Type': 'image/png'});
//         img.pipe(res);
//     } catch (err) {
//
//         return res.status(500).json({error_msg: "code can not use ", error_code: "500"});
//     }
// };

exports.getQR_code_link = async (req, res) => {

    try {

        let getTokenQuery = config.wechat_token_url + queryString.stringify({
            grant_type: `client_credential`,
            appid: config.wechat_appID,
            secret: config.wechat_secret
        });
        let [, returnBody] = await requestFun("", "GET", getTokenQuery);
        if (returnBody[`errcode`] === 42001) {
            return res.status(405).json({error_msg: "access_token expired", error_code: "405"});
        }

        let JSONObject = {
            "expire_seconds": 60000,
            "action_name": "QR_STR_SCENE",
            "action_info": {"scene": {"scene_str": req.user.uuid}}
        };
        let getQrcodeQuery = config.qrcode_create_link + queryString.stringify({access_token: returnBody[`access_token`]});

        let [, qrTicketRes] = await requestFun(JSONObject, "POST", getQrcodeQuery);
        if (qrTicketRes[`errcode`] === 42001) {
            return res.status(405).json({error_msg: "access_token expired", error_code: "405"});
        }
        let finalTicketUrl = config.wechat_showqrcode_link + queryString.stringify({ticket: qrTicketRes.ticket});

        return res.status(200).json({error_msg: "OK", error_code: "0", data: {QRUrl: finalTicketUrl}});

    } catch (err) {
        logger.error(`微信生成QR码`, {req: req, error: err.message});
        return res.status(503).json({error_msg: "code can not use ", error_code: "503"});
    }
};
exports.msg_holder = async (req, res) => {
    try {
        // let returnData = {
        //     tousername: 'gh_139fe21b74d8',
        //     fromusername: 'ocNtC1m_8d2YZ36KWbilvqf0K5LQ',
        //     createtime: '1540891403',
        //     msgtype: 'event',
        //     event: 'subscribe',
        //     eventkey: 'qrscene_d0c04dd0-db3a-11e8-8743-a710340f75f8',
        //     ticket: 'gQES8DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAycDR6UFFDTXJkMm0xTmY5cDFyYzUAAgTvHthbAwRg6gAA'
        // };
        let returnData = req.body.xml;

        if (tool.isEmpty(returnData[`eventkey`])) {
            return res.status(400).json({
                error_msg: "return value from QR code is null, please try later",
                error_code: "400"
            });
        }

        let userUUidFromQr = (returnData[`eventkey`]).split(`_`)[1];
        if (tool.isEmpty(userUUidFromQr)) {
            return res.status(400).json({
                error_msg: "OPENID is null",
                error_code: "400"
            });

        }
        let [, requestResult_1] = await requestFun(null, 'GET', `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wechat_appID}&secret=${config.wechat_secret}`);

        let token = requestResult_1[`access_token`];
        let OPENID = returnData[`fromusername`];
        let userLink = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${OPENID}&lang=zh_CN`;
        let [, requestResult] = await requestFun(null, 'GET', userLink);

        if (requestResult.subscribe === 0) {
            return res.status(404).json({error_msg: "this user's subscribe status is false", error_code: "404"});
        }
        let real_name_flag = true;
        let real_name_result = await transfers_func(requestResult[`openid`], 1);
        if (real_name_result.result_code === `FAIL` && real_name_result.err_code_des === `非实名用户账号不可发放`) {

            real_name_flag = false;
        }

        let wechatUserInfo = {
            wechatID: 'WE' + (Math.random() * Date.now() * 10).toFixed(0),
            wechat_user_info: requestResult,
            qr_info: returnData,
            openID: requestResult[`openid`],
            profileImgUrl: requestResult[`headimgurl`],
            hasRealNameAuthed: real_name_flag,
            activeStatus: true,
            nickname: requestResult[`nickname`]
        };


        let newUser = await userModel.findOneAndUpdate({uuid: userUUidFromQr},
            {$push: {wechatAccounts: wechatUserInfo}}, {new: true});

        return res.status(200).json({error_msg: "OK", error_code: "0", data: newUser});
    } catch (err) {
        logger.error(`微信回调`, {req: req, error: err.message});
        return res.status(503).json({error_msg: "Verification code confirmed", error_code: "503"});
    }
};

exports.checkToken = (req, res) => {
    let query = url.parse(req.url, true).query;
    //console.log("*** URL:" + req.url);
    //console.log(query);
    let signature = query[`signature`];
    let echostr = query[`echostr`];
    let timestamp = query['timestamp'];
    let nonce = query[`nonce`];
    let oriArray = [];
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = config.TOKEN;//这里是你在微信开发者中心页面里填的token，而不是****
    oriArray.sort();
    let original = oriArray.join('');
    console.log("Original str : " + original);
    console.log("Signature : " + signature);
    let scyptoString = sha1(original);
    if (signature === scyptoString) {
        res.end(echostr);
        console.log("Confirm and send echo back");
    } else {

        res.end(false);

    }
};