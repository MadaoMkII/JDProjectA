// const request = require('request');
// let requestFun = (JSONObject, method, url) => {
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
// let requestBody =
//     {
//         "sender": "rest",
//         "ver": "1.0.0",
//         "mid": "999812666555013",
//         "tid": "T0000000",
//         "pay_type": 1,
//         "tx_type": 1,
//         "params":
//             {
//                 "layout": "1",
//                 "order_no": "NO012345678",
//                 "amt": "120000",
//                 "cur": "NTD",
//                 "order_desc": "測試 3C 網站購物",
//                 "capt_flag": "0",
//                 "result_flag": "1",
//                 "post_back_url": "http://www.baidu.com/postback",
//                 "result_url": "https://www.baidu.com/result"
//
//
//             }
//     }
// // let getResult = async () => {
// //     let [, result] = await requestFun(requestBody, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/auth.ashx");
// //     console.log(result)
// //     console.log(result.params.hpp_url)
// //     let [, result2] = await requestFun({},"get",result.params.hpp_url);
// //
// //     console.log(`__________________________________________________________`);
// //     console.log(result2);
// // };
// // getResult();7
// //
// const moment = require('moment-timezone');
// const dateThailand = moment.tz(Date.now(), "Asia/Shanghai");
// let correctDate = dateThailand.format(`YYYY-MM-DDTHH:mm:ss`);
// console.log(correctDate)
// //console.log(correctDate.toString());
//
// // const rebateModel = require('./modules/rebate').rebateModel;
// //
// // let x = new rebateModel();
// // console.log(new Date(`Sat Dec 15 2018 19:32:12 GMT+0800 (China Standard Time)`))
// // rebateModel.findOne({status: `2X`}, (one, data) => {
// //     //const dateTxhailand = moment.tz(data.create, "Asia/Shanghai");
// //     console.log(data.created_at.toString())
// //
// // })
// //console.log(new Date())
// // rebateModel
// var http = require('http');
//
// const xml = `<xml>
//
// <mch_appid>wxe062425f740c30d8</mch_appid>
//
// <mchid>10000098</mchid>
//
// <nonce_str>3PG2J4ILTKCH16CQ2502SI8ZNMTM67VS</nonce_str>
//
// <partner_trade_no>100000982014120919616</partner_trade_no>
//
// <openid>ohO4Gt7wVPxIT1A9GjFaMYMiZY1s</openid>
//
// <check_name>FORCE_CHECK</check_name>
//
// <re_user_name>张三</re_user_name>
//
// <amount>100</amount>
//
// <desc>节日快乐!</desc>
//
// <spbill_create_ip>10.2.3.10</spbill_create_ip>
//
// <sign>C97BDBACF37622775366F38B629F45E3</sign>
//
// </xml>`;
//
// const tenpay = require('tenpay');
// const config = {
//     appid: '公众号ID',
//     mchid: '微信商户号',
//     partnerKey: '微信支付安全密钥',
//     pfx: require('fs').readFileSync('证书文件路径'),
//     notify_url: '支付回调网址',
//     spbill_create_ip: 'IP地址'
// };
// // 方式一
// const api = new tenpay(config);
// // 方式二
// const api = tenpay.init(config);
//
// // 调试模式(传入第二个参数为true, 可在控制台输出数据)
// const api = new tenpay(config, true);
//
// // 沙盒模式(用于微信支付验收)
// const sandboxAPI = await tenpay.sandbox(config);

let x = ["1","x","v"];
console.log(x[1])
