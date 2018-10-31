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
    qrcode_create_link: `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=`,
    showqrcode_link: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=`,
    access_token: `15_YJ8_gT97dPMAI-LETgjmASeZyvKYzreHCxUEHxGaOsCzm0HKBcM44sKju11eF7X5m6BnEsPzJAuAWLDUEWaXHaqI5rmKIZFYHRtEEteQcp94jBjzHPIixeUlS2biA1dL5PExPqdgklzxR9GFWGTdABALVI`
};

