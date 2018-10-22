const logger = require('../logging/logging').logger;
const nodemailer = require('nodemailer');
const config = require('../config/develop');
const redis = require("redis"),
    redisClient = redis.createClient();
const userAccountModel = require('../modules/userAccount').userAccountModel;

let smtpConfig = {
    host: 'hwsmtp.exmail.qq.com',
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: config.mailusername,
        pass: config.mailpassword
    }

};
let transporter = nodemailer.createTransport(smtpConfig);
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        logger.info('Server is ready to take our messages' + success);
    }
});


let sendEmail = (emailAddress, massage) => {

    let mailOptions = {
        from: '邮箱验证提醒系统<baodan@usaboluo.com>', // sender address
        to: emailAddress, // list of receivers
        subject: "邮箱验证邮件", // Subject line
        text: '', // plain text body
        html: '<b>' + "邮箱验证" + '</b>  <td id="QQMAILSTATIONERY" ' +
        'style="background:url(https://rescdn.qqmail.com/zh_CN/htmledition/images/xinzhi/bg/b_01.jpg);' +
        ' min-height:550px; padding:100px 55px 200px; ">' +
        `<div>${massage}</div></td>` // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        //console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
};
let func_send_Email = async (req, res, category) => {
    try {
        let email_address = req.body.email_address;
        let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
        let existsResult = await redisClient.exists(`category:${category},email_address:${email_address}`);
        if (existsResult === 1) {
            return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
        }
        await sendEmail(email_address, `注册码是${verity_code}`);
        await redisClient.multi().set(`category:${category},email_address:${email_address}`, verity_code, 'EX', 1000);

        logger.info("send_Email", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.json({error_msg: "OK", error_code: "0", verity_code: verity_code});
    } catch (err) {
        logger.error("send_Email", {
            level: req.user.role,
            response: `Internal Service Error`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(503).json({
            error_msg: "Internal Service Error",
            error_code: "503"
        });
    }

};

exports.sendConfirmationEmail = async (req, res) => {

    try {
        let email_address = req.body.email_address;
        let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
        let key = `category:updateEmail,verity_code:${verity_code}`;


        let user = await userAccountModel.findOne({email_address: email_address}, {email_address: 1});
        if (user) {
            return res.status(404).json({
                error_msg: "This email_address has been registered yet",
                error_code: "404"
            });
        }
        let result = await redisClient.exists(key);

        if (result === 1) {
            return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
        }
        await redisClient.set(key, email_address, 'EX', 3600, redis.print);
        await sendEmail(email_address, `驗證碼是${verity_code},請於一分鐘內修改`);

        logger.info("sendConfirmationEmail", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.json({error_msg: "OK", error_code: "0", verity_code: verity_code});

    } catch (err) {

        logger.error("sendConfirmationEmail", {
            level: req.user.role,
            response: `Internal Service Error`,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body,
            error: err
        });
        return res.status(503).json({
            error_msg: "Internal Service Error",
            error_code: "503"
        });
    }

};


exports.getBackFromEmail = (req, res) => {
    let email_address = req.body.email_address;

    userAccountModel.findOne({email_address: email_address}, {email_address: 1}, (err, user) => {
        if (user) {

            redisClient.exists("tempPassword:" + email_address, function (err, result) {
                if (err) {
                    return res.status(503).json({error_msg: "Internal Service Error", error_code: "503"});
                }
                if (result === 1) {
                    return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
                } else {
                    if (!err) {
                        let randomString = Math.random().toString(36).slice(-10);
                        let hashedPassword =
                            require('crypto').createHash('md5').update(randomString + config.saltword).digest('hex');
                        sendEmail(email_address, `临时密码是${randomString}`);

                        userAccountModel.update({email_address: email_address}, {$set: {password: hashedPassword}},
                            (err) => {
                                if (err) {
                                    return res.status(500).json({"error_code": 500, error_massage: "Bad happened"});
                                }
                                //发送成功
                                //限制访问频率60秒
                                redisClient.multi().set('tempPassword:' + email_address, randomString, 'EX', 1800)
                                    .exec(function (err) {
                                        if (err) {
                                            return res.status(503).json({
                                                error_msg: "Internal Service Error",
                                                error_code: "503"
                                            });
                                        } else {
                                            return res.json({
                                                error_msg: "Success sent verification code",
                                                error_code: "0"
                                            });
                                        }
                                    });
                            });

                    }
                }
            });
        } else {
            return res.status(208).json({
                error_msg: "This email_address has not been registered yet",
                error_code: "208"
            });
        }

    });
};

exports.checkConfirmationEmail = (req, res) => {
    let verity_code = req.body.code;
    let email_address = req.body.email_address;

    let key = `category:updateEmail,verity_code:${verity_code}`;
    redisClient.get(key, function (err, result) {

        if (err) return res.status(500).json({error_msg: "Internal Server Error", error_code: "500"});
        //服务器不存在校验码或已被删除
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }

        if (code === req.user.email_address) {

            userAccountModel.update({uuid: req.use.uuid}, {$set: {email_address: email_address}}, function (err) {
                if (err) {
                    return res.status(404).json({error_msg: "Bad happened", error_code: "404"});
                }

                return res.status(200).json({error_msg: "Verification code confirmed", error_code: "200"});
            });

        } else {
            return res.status(404).json({error_msg: "Verification code is wrong", error_code: "404"});
        }
    });

};
