const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logging').logger;
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
        let query = `&state=${req.user.uuid}||${req.query.alipayAccount}`;
        let img = qr.image(config.alipay_auth_code_url + query, {size: 10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (err) {
        logger.error(`获取支付宝二维码`, {req: req, error: err});
        return res.status(503).json({error_msg: "code can not use ", error_code: "503"});
    }
};
exports.receiveCallback = async (req, res) => {

    try {

        console.log(`Account1:` + (req.query.state.toString()).split(`||`)[0]);
        console.log(`Account2:` + (req.query.state.toString()).split(`||`)[1]);

        let step_1_response = {
            code: req.query[`auth_code`],
            grant_type: `authorization_code`,
        };
        logger.info(`获取支付宝二维码1`, {req:req,error: step_1_response});
        const step_2_response = await alipaySdk.exec('alipay.system.oauth.token', {
            code: step_1_response.code,
            grant_type: `authorization_code`
        });
        // result 为 API 介绍内容中 “响应参数” 对应的结果
        logger.info(`获取支付宝二维码2`, {req:req,error: step_2_response});
        const step_3_response = await alipaySdk.exec('alipay.user.info.share', {
            auth_token: step_2_response.accessToken
        });
        const aliPayAccount =
            {
                alipayAccount: (req.query.state.toString()).split(`||`)[1],
                userId: step_3_response.userId,
                avatar: step_3_response.avatar,
                province: step_3_response.province,
                city: step_3_response.city,
                nickName: step_3_response.nickName,
                isStudentCertified: step_3_response.isStudentCertified,
                userType: step_3_response.userType,
                userStatus: step_3_response.userStatus,
                isCertified: step_3_response.isCertified,
                gender: step_3_response.gender
            };
        logger.info(`获取支付宝二维码3`, {req:req,error: step_3_response});
        let alipayUser = await userModel.findOneAndUpdate({uuid: (req.query.state.toString()).split(`||`)[0]},
            {$push: {aliPayAccounts: aliPayAccount}}, {new: true});
        console.log(alipayUser)
        // return res.status(200).json({error_msg: `OK`, error_code: "0", data: step_3_response});

        logger.info(`绑定二维码`, {req: req, error: step_3_response});
        res.redirect('/temp.html');
        res.end();
    } catch (err) {
        console.log(err)
        logger.error(`支付宝扫码失败`, {req: req, error: err});
        return res.status(503).json({error_msg: `Server is busy`, error_code: "503"});
    }

};
