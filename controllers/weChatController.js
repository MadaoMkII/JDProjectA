const config = require('../config/develop');
let url = require("url");
let crypto = require("crypto");
let qr = require('qr-image');
const request = require('request');
const userModel = require('../modules/userAccount').userAccountModel;
const tool = require('../config/tools');

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
exports.getQR_code = async (req, res) => {

    try {
        let JSONObject = {
            "expire_seconds": 60000,
            "action_name": "QR_STR_SCENE",
            "action_info": {"scene": {"scene_id": "002", "scene_str": req.user.uuid}}
        };
        let [, body] = await requestFun(JSONObject, "POST", config.qrcode_create_link + config.access_token);
        if (body[`errcode`] === 42001) {
            return res.status(405).json({error_msg: "access_token expired", error_code: "405"});
        }
        let img = qr.image(body.url, {size: 10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (err) {
        return res.status(500).json({error_msg: "code can not use ", error_code: "500"});
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
        //console.log(returnData)
        if (tool.isEmpty(returnData[`eventkey`])) {
            return res.status(400).json({
                error_msg: "retrun value from QR code is null, please try later",
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
        let token = config.access_token;
        let OPENID = returnData[`fromusername`];
        let userLink = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${OPENID}&lang=zh_CN`;
        let [, requestResult] = await requestFun(null, 'GET', userLink);

        if (requestResult.subscribe === 0) {
            return res.status(404).json({error_msg: "this user's subscribe status is false", error_code: "404"});
        }

        let wechatUserInfo = {
            wechatID: 'WE' + (Math.random() * Date.now() * 10).toFixed(0),
            wechat_user_info: requestResult,
            qr_info: returnData,
            openID: userUUidFromQr,
            profileImgUrl: requestResult[`headimgurl`],
            hasRealNameAuthed: true,
            activeStatus: true,
            nickname: requestResult[`nickname`]
        };

        let newUser = await userModel.findOneAndUpdate({uuid: userUUidFromQr},
            {$push: {wechatAccounts: wechatUserInfo}}, {new: true});

        return res.status(200).json({error_msg: "OK", error_code: "0", data: newUser});
    } catch (e) {

        return res.status(500).json({error_msg: "Verification code confirmed", error_code: "500"});
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
        console.log("Failed!");
    }
};