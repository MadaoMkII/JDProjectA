const logger = require('../logging/logging').logger;
const nodemailer = require('nodemailer');
const config = require('../config/develop');
const tools = require('../config/tools');
const redis = require("redis"),
    redisClient = redis.createClient();
const userAccountModel = require('../modules/userAccount').userAccountModel;
const dgBillModel = require('../modules/dgBill').dgBillModel;

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


let sendEmail = async (emailAddress, massage) => {

    let mailOptions = {
        from: '邮箱验证提醒系统<sendmail@yubaopay.com.tw>', // sender address
        to: emailAddress, // list of receivers
        subject: "邮箱验证邮件", // Subject line
        text: '', // plain text body
        html: '<b>' + "邮箱验证" + '</b>  <td id="QQMAILSTATIONERY" ' +
        'style="background:url(https://rescdn.qqmail.com/zh_CN/htmledition/images/xinzhi/bg/b_01.jpg);' +
        ' min-height:550px; padding:100px 55px 200px; ">' +
        `<div>${massage}</div></td>` // html body
    };

    await transporter.sendMail(mailOptions);
    //     , (error, info) => {
    //     if (error) {
    //         return console.log(error);
    //     }
    //     //console.log('Message sent: %s', info.messageId);
    //     // Preview only available when sending through an Ethereal account
    //     //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    //
    // });
};
exports.func_send_Email = async (req, res) => {
    try {
        let billObject = await dgBillModel.findOne({billID: req.body.billID});

        //let email_address = billObject.userInfo.email_address;
        let email_address = "shaunli319@gmail.com"

        if (tools.isEmpty(billObject.processOrder) || tools.isEmpty(billObject.processOrder.imageFilesNames)) {
            return res.status(404).json({error_msg: "can not find images", error_code: "404"});
        }
        let picArray = billObject.processOrder.imageFilesNames;
        let resultArray = [];

        for (let pic of picArray) {
            resultArray += `<img style="-webkit-user-select: none;cursor: zoom-out;"
            src=${pic} width="610" height="610">`;

        }

        await sendEmail(email_address, `<div id="dv_15" class="blk_wrapper" style="">
                                                <table width="600" cellspacing="0" cellpadding="0" border="0"
                                                       class="blk" name="blk_card">
                                                    <tbody>
                                                    <tr>
                                                        <td class="bmeImageCard" align="center"
                                                            style="padding-left:20px; padding-right:20px; padding-top:0px; padding-bottom:0px;">
                                                            <table width="100%" cellspacing="0" cellpadding="0"
                                                                   border="0">
                                                                <tbody>
                                                                <tr>
                                                                    <td valign="top" class="bmeImageContainer"
                                                                        style="border-collapse: collapse; background-color: rgba(0, 0, 0, 0);"
                                                                        width="560">
                                                                        <table cellspacing="0" cellpadding="0"
                                                                               border="1" width="100%">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td valign="top" align="top"
                                                                                    class="tdPart">
                                                                                    <table cellspacing="0"
                                                                                           cellpadding="0" border="1"
                                                                                           class="bmeCaptionTable"
                                                                                           style="float:top;"
                                                                                           width="373" align="right">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <td style="padding: 20px 0px 20px 20px; font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-size: 14px; color: rgb(56, 56, 56); text-align: left;"
                                                                                                name="tblCell"
                                                                                                valign="top"
                                                                                                align="left"
                                                                                                class="tblCell">
                                                                                                <div style="line-height: 150%;">

                                                                                                    <br><span
                                                                                                        style="font-size: 30px; font-family: Helvetica, Arial, sans-serif; color: #d63c3c; line-height: 150%;">
                                                                                                    <span style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #1e1e1e; line-height: 150%;"><strong> 提示：</strong></span>

                                                                                                    <em><strong>您有一個交易已經被處理</strong></em></span>
                                                                                                    <br><span
                                                                                                        style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #929292; line-height: 150%;"><strong>交易提示： -</strong> 匯款證明截圖，請您及時確認</span>
                                                                                                    <br>
                                                                                                    <br>
                                                                                                    <!--<br><span-->
                                                                                                        <!--style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #929292; line-height: 150%;">Use code: </span><span-->
                                                                                                        <!--style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #d63c3c; line-height: 150%;"><strong>QprZ33</strong></span>-->
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                                <td valign="top" align="center"
                                                                                    class="tdPart">
                                                                                    <table cellspacing="0"
                                                                                           cellpadding="0" border="0"
                                                                                           class="bmeImageTable"
                                                                                           style="float:left; height: 222px;"
                                                                                           align="center" dimension="30%"
                                                                                           width="187" height="222">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                          ${resultArray}
                                                                                      
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                       <div id="dv_16" class="blk_wrapper" style="">
                                                <table width="600" cellspacing="0" cellpadding="0" border="0"
                                                       class="blk" name="blk_button" style="">
                                                    <tbody>
                                                    <tr>
                                                        <td width="40"></td>
                                                        <td align="center">
                                                            <table class="tblContainer" cellspacing="0" cellpadding="0"
                                                                   border="0" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td height="0"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left">
                                                                        <table cellspacing="0" cellpadding="0"
                                                                               border="0" class="bmeButton" align="left"
                                                                               style="border-collapse: separate;">
                                                                            <tbody>
                                                                            <tr>
                                                                                <td style="border-radius: 20px; border: 0px none transparent; text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 14px; padding: 10px 40px; font-weight: bold; background-color: rgb(214, 60, 60);"
                                                                                    class="bmeButtonText"><span
                                                                                        style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: rgb(255, 255, 255);">
<a style="color:#FFFFFF;text-decoration:none;" target="_blank" href="http://www.baidu.com">點擊了解詳情</a></span></td>
                                                                            </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td height="0"></td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td width="40"></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>`);

        logger.info("send_Email", {
            level: req.user.role,
            user: req.user.uuid,
            email: req.user.email_address,
            location: (new Error().stack).split("at ")[1],
            body: req.body
        });
        return res.json({error_msg: "OK", error_code: "0"});
    } catch (err) {
        console.log(err)
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
        let key = `category:updateEmail,email_address:${email_address}`;


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
        await redisClient.set(key, verity_code, 'EX', 3600, redis.print);
        //await sendEmail(email_address, `驗證碼是${verity_code},請於一分鐘內修改`);

        if (req.user) {
            logger.info("sendConfirmationEmail", {
                level: req.user.role,
                user: req.user.uuid,
                email: req.user.email_address,
                location: (new Error().stack).split("at ")[1],
                body: req.body
            });
        } else {

            logger.info("sendConfirmationEmail", {
                location: (new Error().stack).split("at ")[1],
                body: req.body
            });

        }

        return res.status(200).json({error_msg: "OK", error_code: "0", verity_code: verity_code});

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

    let key = `category:updateEmail,email_address:${email_address}`;
    redisClient.get(key, function (err, result) {

        if (err) return res.status(500).json({error_msg: "Internal Server Error", error_code: "500"});
        //服务器不存在校验码或已被删除
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }

        if (verity_code === result) {

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
exports.sendEmail = sendEmail;