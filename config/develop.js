module.exports = {
    dbName: `yubaopay`,
    //url: 'mongodb://localhost:27017/yubaopay',
    url: `mongodb://root:!Hothothot2@dds-3ns4adb9c4a4e0641235-pub.mongodb.rds.aliyuncs.com:3717,dds-3ns4adb9c4a4e0642179-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-9624007`,
    session: {
        secret: 'abc',
        resave: true,
        cookie: {_expires: 60000000},
        saveUninitialized: true
    },
    saltword: 'ABL',
    mailusername: "sendmail@yubaopay.com.tw",
    mailpassword: "Yubao888888",
    server_name: "www.yubaopay.com.tw",
    KEY: Buffer.from('8vApxL1k5GPAsJrM4vxpxLs543PhsJrM', 'utf8'), // This key should be stored in an environment variable
    HMAC_KEY: Buffer.from('GnJd7EgzjjWj4aY9', 'utf8'),
    TOKEN: `w2e3c4h5angemoney`,
    wechat_appID: `wx61ff88bc59103229`,
    wechat_token_url: `https://api.weixin.qq.com/cgi-bin/token?`,
    wechat_secret: `3f247d5895294d26e1bb409fd3f0d1f4`,
    qrcode_create_link: `https://api.weixin.qq.com/cgi-bin/qrcode/create?`,
    wechat_showqrcode_link: `https://mp.weixin.qq.com/cgi-bin/showqrcode?`,

    alipay_auth_code_url: `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2018102961952197&scope=auth_user&redirect_uri=http%3a%2f%2fwww.yubaopay.com.tw%2falipay%2freceiveCallback`,
    alipay_production_gatway: `https://openapi.alipay.com/gateway.do`,
    alipay_App_ID: 2016092000552091
};


