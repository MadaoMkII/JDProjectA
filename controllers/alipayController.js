const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
//const request = require('request');
const fs = require('fs');
const AlipaySdk = require('alipay-sdk').default;
let qr = require('qr-image');

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
// let requestFun = (JSONObject, method, url) => {
//
//     return new Promise((resolve, reject) => {
//         request({
//             url: url,
//             method: method,
//             json: true,   // <--Very important!!!
//             body: JSONObject
//         }, (error, response, body) => {
//             if (error) {
//                 reject(error)
//             } else {
//                 resolve([response, body]);
//             }
//         });
//     });
// };
exports.get_alipay_QR_code = async (req, res) => {

    try {
        let query = `&state=${req.user.uuid}||${req.query.alipayAccount}`
        let img = qr.image(config.alipay_auth_code_url + query, {size: 10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (err) {
        return res.status(500).json({error_msg: "code can not use ", error_code: "500"});
    }
};
exports.receiveCallback = async (req, res) => {

    try {

        console.log(req.query.state)
        console.log(`Account1:` + (req.query.state.toString()).split(`||`)[0]);
        console.log(`Account2:` + (req.query.state.toString()).split(`||`)[1]);

        let step_1_response = {
            code: req.query[`auth_code`],
            grant_type: `authorization_code`,
        };

        const step_2_response = await alipaySdk.exec('alipay.system.oauth.token', {
            code: step_1_response.code,
            grant_type: `authorization_code`
        });

        // result 为 API 介绍内容中 “响应参数” 对应的结果

        const step_3_response = await alipaySdk.exec('alipay.user.info.share', {
            auth_token: step_2_response.accessToken
        });
console.log(step_3_response)
        const aliPayAccount =
            {
                alipayAccount: (req.query.state.toString()).split(`||`)[1],
                user_id: step_3_response.user_id,
                avatar: step_3_response.avatar,
                province: step_3_response.province,
                city: step_3_response.city,
                nick_name: step_3_response.nickName,
                is_student_certified: step_3_response.is_student_certified,
                user_type: step_3_response.user_type,
                user_status: step_3_response.user_status,
                is_certified: step_3_response.is_certified,
                gender: step_3_response.gender
            };

        let alipayUser = await userModel.findOneAndUpdate({uuid: (req.query.state.toString()).split(`||`)[0]},
            {$push: {aliPayAccounts: aliPayAccount}}, {new: true});
        console.log(alipayUser)
        // return res.status(200).json({error_msg: `OK`, error_code: "0", data: step_3_response});
        res.redirect('/temp.html');
        res.end();
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