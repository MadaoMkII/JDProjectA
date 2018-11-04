const queryString = require('query-string');

Date.prototype.Format = (fmt) => { //author: meizz
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
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


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
exports.receiveCallback = (req, res) => {

    // req.query.app_id = 2016092000552091;
    // req.query.source = 2016092000552091;
    // req.query.scope = 2016092000552091;
    // req.query.auth_code = 2016092000552091;

    let sendQuery = {
        timestamp: new Date(),
        method: `alipay.system.oauth.token`,
        app_id: `2016092000552091`,
        sign_type: `RSA2`,
        version: `1.0`,
        grant_type: `authorization_code`,
        code: req.query.auth_code,
        charset: `utf-8`
    };
    const stringified = queryString.stringify({sendQuery});

    return res.status(200).json({error_msg: `OK`, error_code: "0", data: stringified});



}