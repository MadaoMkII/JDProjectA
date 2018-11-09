module.exports = {

    url: 'mongodb://localhost:27017/yubaopay',
    username: '',
    password: '',
    session: {
        secret: 'abc',
        resave: true,
        cookie: {_expires: 60000000},
        saveUninitialized: true
    },
    saltword: 'ABL',
    mailusername: "baodan@usaboluo.com",
    mailpassword: "123baoDAN",
    KEY: new Buffer('8vApxL1k5GPAsJrM4vxpxLs543PhsJrM', 'utf8'), // This key should be stored in an environment variable
    HMAC_KEY: new Buffer('GnJd7EgzjjWj4aY9', 'utf8'),
    TOKEN: `w2e3c4h5angemoney`,
    wechat_appID:`wx61ff88bc59103229&secret=3f247d5895294d26e1bb409fd3f0d1f4`,
    wechat_token_url:`https://api.weixin.qq.com/cgi-bin/token?`,
    qrcode_create_link: `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=`,
    showqrcode_link: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=`,

    alipay_auth_code_url:`https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2018102961952197&scope=auth_user&redirect_uri=http%3a%2f%2fwww.yubaopay.com.tw%2falipay%2freceiveCallback`,
    alipay_production_gatway: `https://openapi.alipaydev.com/gateway.do`,
    alipay_App_ID: 2016092000552091
};


