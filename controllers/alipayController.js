const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const request = require('request');
const fs = require('fs');
const AlipaySdk = require('alipay-sdk').default;
const alipaySdk = new AlipaySdk({
    appId: "2018102961952197",
    privateKey: fs.readFileSync('./keys/应用私钥2048.txt', 'ascii'),
    alipayPublicKey: fs.readFileSync('./keys/应用公钥2048.txt', 'ascii'),
    camelcase: true,
    format: `JSON`,
    charset: `utf-8`,
    sign_type: "RSA2",
    gateway: `https://openapi.alipay.com/gateway.do`
});
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
exports.receiveCallback = async (req, res) => {

    // req.query.app_id = 2016092000552091;
    // req.query.source = 2016092000552091;
    // req.query.scope = 2016092000552091;
    // req.query.auth_code = 2016092000552091;
    try {
        let step_1_response = {

            code: req.query[`auth_code`],
            grant_type: `authorization_code`,
        }
console.log(step_1_response)
        const step_2_response = await alipaySdk.exec('alipay.system.oauth.token', step_1_response);

        // result 为 API 介绍内容中 “响应参数” 对应的结果
        console.log(step_2_response)
        const step_3_response = await alipaySdk.exec('alipay.user.info.share', {
            auth_token: step_2_response.accessToken
        });

        return res.status(200).json({error_msg: `OK`, error_code: "0", data: step_3_response});

    } catch (err) {
        //...
        console.log(err);

    }


};

exports.set_AlipayAccount = async (req, res) => {
    let alipay_user_info_share_response = {
        "user_id": "2088102104794936",
        "avatar": "http://tfsimg.alipay.com/images/partner/T1uIxXXbpXXXXXXXX",
        "province": "安徽省",
        "city": "安庆",
        "nick_name": "支付宝小二",
        "is_student_certified": "T",
        "user_type": "1",
        "user_status": "T",
        "is_certified": "T",
        "gender": "F"
    };
    let alipay_user_info = {
        "user_id": alipay_user_info_share_response.user_id,
        "avatar": alipay_user_info_share_response.avatar,
        "province": alipay_user_info_share_response.province,
        "city": alipay_user_info_share_response.city,
        "nick_name": alipay_user_info_share_response.nick_name,
        "is_student_certified": alipay_user_info_share_response.is_student_certified,
        "user_type": alipay_user_info_share_response.user_type,
        "user_status": alipay_user_info_share_response.user_status,
        "is_certified": alipay_user_info_share_response.is_certified,
        "gender": alipay_user_info_share_response.gender
    };


    let nuew_user = await userModel.findOneAndUpdate({uuid: req.user.uuid}, {
        $push: {aliPayAccounts: alipay_user_info}

    }, {new: true});
    return res.status(200).json({error_msg: `OK`, error_code: "0", data: nuew_user});
};