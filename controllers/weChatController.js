const config = require('../config/develop');
let url = require("url");
let crypto = require("crypto");
let qr = require('qr-image');
const request = require('request');
const userModel = require('../modules/userAccount').userAccountModel;


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
    let JSONObject = {
        "expire_seconds": 60000,
        "action_name": "QR_STR_SCENE",
        "action_info": {"scene": {"scene_id": "002", "scene_str": req.user.uuid}}
    };
    let [ , body] = await requestForPost(JSONObject, "POST", config.qrcode_create_link + `15_6x6U958wabOgMoE74ZwEKk-vZnatznEL6qDVpEFCSfs31UTn3D9reSLsxoRe2IoO-NHFxD8Smld6b3_Imh59qTM2_tjY3GrJCjaMRwgTJtdaheIAnTocmmB7tItWY2IVOt6WKG390FehuKxBTGCaAAAERN`);
    console.log(body)

    let img = qr.image(body.url,{size :10});
    res.writeHead(200, {'Content-Type': 'image/png'});
    img.pipe(res);
};


exports.msg_holder = async (req, res) => {
    try {

        let data = req.body.xml;
        console.log(data)
        let userUUidFromQr = ("qrscene_d0c04dd0-db3a-11e8-8743-a710340f75f8").split(`_`)[1]
        await userModel.findOneAndUpdate({ uuid:userUUidFromQr },{$pull});

        return res.status(200).json({data:data});
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