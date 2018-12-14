const request = require('request');
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
let requestBody =
    {
        "sender": "rest",
        "ver": "1.0.0",
        "mid": "999812666555013",
        "tid": "T0000000",
        "pay_type": 1,
        "tx_type": 1,
        "params":
            {
                "layout": "1",
                "order_no": "NO012345678",
                "amt": "120000",
                "cur": "NTD",
                "order_desc": "測試 3C 網站購物",
                "capt_flag": "0",
                "result_flag": "1",
                "post_back_url": "http://www.baidu.com/postback",
                "result_url": "https://www.baidu.com/result"


            }
    }
// let getResult = async () => {
//     let [, result] = await requestFun(requestBody, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/auth.ashx");
//     console.log(result)
//     console.log(result.params.hpp_url)
//     let [, result2] = await requestFun({},"get",result.params.hpp_url);
//
//     console.log(`__________________________________________________________`);
//     console.log(result2);
// };
// getResult();7

console.log(new Date())