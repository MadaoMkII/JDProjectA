const logger = require('../logging/logger');
const userModel = require('../modules/userAccount').userAccountModel;
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


let sendEmail = (emailAddress, massage, res) => {

    let mailOptions = {
        from: '邮箱验证提醒系统<baodan@usaboluo.com>', // sender address
        to: emailAddress, // list of receivers
        subject: "邮箱验证邮件", // Subject line
        text: '', // plain text body
        html: '<b>' + "邮箱验证" + '</b>  <td id="QQMAILSTATIONERY" ' +
        'style="background:url(https://rescdn.qqmail.com/zh_CN/htmledition/images/xinzhi/bg/b_01.jpg);' +
        ' min-height:550px; padding:100px 55px 200px; ">' +
        '<div>' + massage + '</div></td>' // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return res.status(200).send({success: true, message: 'Successed Saved'});
    });
};

exports.sendConfirmationEmail = (req, res) => {
    let email_address = req.body.email_address;
    let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);


    userAccountModel.findOne({email_address: email_address},{email_address:1}).exec().then((err, user) => {
        if (user) {
            return res.status(208).json({
                error_msg: "This email_address has already been registered yet",
                error_code: "208"
            });
        }

        redisClient.exists("email_address:" + email_address, function (err, result) {
            if (err) {
                return res.status(503).json({error_msg: "Internal Service Error", error_code: "503"});
            }
            if (result === 1) {
                return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
            } else {


                if (!err) {

                    sendEmail(email_address, `注册码是${verity_code}`, res);
                    //发送成功
                    let multi = redisClient.multi();
                    //限制访问频率60秒
                    multi.set('email_address:' + email_address, verity_code, 'EX', 1000)
                        .exec(function (err) {
                            if (err) {
                                return res.status(503).json({
                                    error_msg: "Internal Service Error",
                                    error_code: "503"
                                });
                            } else {
                                return res.json({error_msg: "Already sent verification code", error_code: "0"});
                            }

                        });
                }
            }
        })
    });


};

exports.checkConfirmationEmail = (req, res) => {
    let code = req.body.code;
    let email_address = req.body.email_address;
    let tel_number = req.body.tel_number;
    redisClient.get("email_address:" + email_address, function (err, result) {

        if (err) return res.status(500).json({error_msg: "Internal Server Error", error_code: "500"});
        //服务器不存在校验码或已被删除
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }

        if (parseInt(code) === parseInt(result)) {

            userModel.update({tel_number: tel_number}, {$set: {email_address: email_address}}, function (err, doc) {
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