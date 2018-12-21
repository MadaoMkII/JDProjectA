const tenpay = require('tenpay');
const config = {
    appid: 'wx61ff88bc59103229',
    mchid: '1515806061',
    mch_id: '1515806061',
    partnerKey: 'wa5c1a8e6t4ybx65t3N13w2B15jf6A48',
    pfx: require('fs').readFileSync('./keys/apiclient_cert.p12'),
    notify_url: 'http://www.yubaopay.com.tw/receive'
    //spbill_create_ip: 'IP地址'
};

// 调试模式(传入第二个参数为true, 可在控制台输出数据)
// const api = new tenpay(config);
// (async () => {
//     try {
//         const sandboxAPI = await tenpay.sandbox(config, true);
//         let result = await api.transfers({
//             partner_trade_no: 'xg1h12',
//             openid: 'ocNtC1llqNtJG7aVGaV0uZ0yuhRI',
//             re_user_name: '假的名字',
//             check_name: "FORCE_CHECK",//FORCE_CHECK NO_CHECK
//             amount: 10,
//             desc: '企业付款描述信息'
//         });
//         if (result.result_code === `FAIL` && result.err_code_des === `非实名用户账号不可发放`) {
//
//             console.log(`未实名`)
//         }
//         console.log(result)
//     } catch (e) {
//         console.log(`!` + e)
//     }
//
// })();

console.log(`YBWETF${Math.random().toString(36).substr(2).toUpperCase()}`)