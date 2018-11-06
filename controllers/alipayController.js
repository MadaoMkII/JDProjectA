const queryString = require('query-string');
const config = require('../config/develop');
const userModel = require('../modules/userAccount').userAccountModel;
const request = require('request');
const fs = require('fs');
const AlipaySdk = require('alipay-sdk').default;
const alipaySdk =  new AlipaySdk({
    appId: "2016092000552091",
    privateKey: fs.readFileSync('./keys/应用私钥2048.txt', 'ascii'),
    alipayPublicKey: fs.readFileSync('./keys/应用公钥2048.txt', 'ascii'),
    camelcase: true,
    format:`JSON`,
    charset:`utf-8`,
    sign_type:"RSA",
    gateway:`https://openapi.alipaydev.com/gateway.do`
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
    Date.prototype.Format = (fmt) => {
        let o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1,
                (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    // req.query.app_id = 2016092000552091;
    // req.query.source = 2016092000552091;
    // req.query.scope = 2016092000552091;
    // req.query.auth_code = 2016092000552091;
    try {
    let sendQuery = {
        timestamp: new Date(),
        method: `alipay.system.oauth.token`,
        app_id: `2016092000552091`,
        sign_type: `RSA2`,
        version: `1.0`,
        grant_type: `authorization_code`,
        code: req.query[`auth_code`],
        charset: `utf-8`
    };
    let xrequest = {
        code: "8bcda74191cc48c28c0d9816c6fcYX04",
        grant_type: `authorization_code`,

    }

        //const result = await alipaySdk.exec('alipay.system.oauth.token', xrequest);

        // result 为 API 介绍内容中 “响应参数” 对应的结果
        //console.log(result);

        const USER_result = await alipaySdk.exec('alipay.user.info.share', {

            auth_token:"authusrBd7a075fd4ec746d38a21185674f82X04"
        });
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: USER_result});

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