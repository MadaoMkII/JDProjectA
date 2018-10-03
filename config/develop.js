module.exports = {

    url: 'mongodb://root:****@dds-3ns4adb9c4a4e0641235-pub.mongodb.rds.aliyuncs.com:3717',
    username: '',
    password: '',
    session: {
        secret: 'abc',
        resave: true,
        saveUninitialized: true
    },
    saltword: 'ABL',
    mailusername: "baodan@usaboluo.com",
    mailpassword: "123baoDAN",
    KEY: new Buffer('8vApxL1k5GPAsJrM4vxpxLs543PhsJrM', 'utf8'), // This key should be stored in an environment variable
    HMAC_KEY: new Buffer('GnJd7EgzjjWj4aY9', 'utf8')

};
