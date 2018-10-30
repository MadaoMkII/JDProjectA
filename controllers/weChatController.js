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


let requestForPost = (JSONObject, method, url) => {
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
        let [, body] = await requestForPost(JSONObject, "POST", config.qrcode_create_link + `15_ZWlgidDPUTi6wBGTNYoDwCKhTudge1Z-0XmIF9-W34xrKY6vDJ_kw4Ecdt9VSqV2ovvpEgu20-M6auYVKr9s0A_dAWbsHSa2EOYH6S-b_8oQvhsC-Pip4sNRizA6Ab7M8pW4ZHYzQOBqWDD2MWMdAGAXHX`);
        if (body.errcode === 42001) {
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

        let returnData = req.body.xml;
        console.log(data)
        if (tool.isEmpty(returnData.eventkey)) {
            return res.status(400).json({
                error_msg: "retrun value from QR code is null, please try later",
                error_code: "400"
            });
        }
        let userUUidFromQr = (returnData.eventkey).split(`_`)[1];



        console.log(userUUidFromQr, returnData)
        await userModel.findOneAndUpdate({uuid: userUUidFromQr}, {$pull: {wechatAccounts: returnData}});

        return res.status(200).json({data: data});
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