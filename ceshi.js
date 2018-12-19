const tenpay = require('tenpay');
const config = {
    appid: 'wx61ff88bc59103229',
    mchid: '1515806061',
    mch_id:'1515806061',
    partnerKey: 'wa5c1a8e6t4ybx65t3N13w2B15jf6A48',
    pfx: require('fs').readFileSync('./keys/apiclient_cert.p12'),
    notify_url: 'http://www.yubaopay.com.tw/receive'
    //spbill_create_ip: 'IP地址'
};

// 调试模式(传入第二个参数为true, 可在控制台输出数据)
const api = new tenpay(config,true);
(async()=>{
try {
    const sandboxAPI = await tenpay.sandbox(config,true);
    let result = await sandboxAPI.transfers({
        partner_trade_no: 'xync112',
        openid: 'ocNtC1m_8d2YZ36KWbilvqf0K5LQ',
        //re_user_name: '李经',
        check_name:"NO_CHECK",
        amount: 100,
        desc: '企业付款描述信息'
    });

    console.log(result)
}catch (e) {
    console.log(e)
}

})();