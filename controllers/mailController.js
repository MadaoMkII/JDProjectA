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
        from: '交易截圖郵件<sendmail@yubaopay.com.tw>', // sender address
        to: emailAddress, // list of receivers
        subject: "交易截圖郵件", // Subject line
        text: '', // plain text body
        html: '<td id="QQMAILSTATIONERY" ' +
        'style="background:url(http://yubaopay.oss-cn-hongkong.aliyuncs.com/images/4917823771418.jpg);' +
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

        let email_address = billObject.userInfo.email_address;
        //let email_address = "js19870219@126.com";

        if (tools.isEmpty(billObject.processOrder) || tools.isEmpty(billObject.processOrder.imageFilesNames)) {
            return res.status(404).json({error_msg: "can not find images", error_code: "404"});
        }
        let picArray = billObject.processOrder.imageFilesNames;
        let resultArray = ``;

        for (let picUrl of picArray) {
            resultArray += `<img style="-webkit-user-select: none;cursor: zoom-out;"
            src=${picUrl} width="610" height="610">`;

        }

        await sendEmail(email_address, `<!doctype html>
<html>
<head>
<meta charset="UTF-8">

<style type="text/css">
	*{
	margin:0;
	padding:0;
	}
    a{text-decoration:none;}	
    li{list-style:none;}
    img{border:none;}
	body{
		background-color:#f5f5f5;
		width:100%;
	}
	.mean{
		margin-left: 96px;
	}
	.head{
		padding:32px 0 32px 0; 
		height:80px;
		width:1200px;
	}
	.content{
		width:1072px; 
		height:100%;
		background-color:#fff;
		padding:56px 64px 40px 64px;
		border-radius: 4px;
		box-shadow: 0 6px 6px 0 rgba(0,0,0,0.08);
	}
	.logo{
		float:left;
	}
	.slogen{
		margin-left:24px;
		margin-top:16px;
		float:left;
	}

	.content_head{
		height:224px;
		width:1072px;
	}
	.order{
	float:left;
	margin-right:48px;
	}
	.p1{
		float:left;
		width:816px;
		line-height:64px;
		font-size:40px;
		font-family: PingFangSC-Semibold;
        color: #333333;
		margin-top:16px;
	}
    .p2{
		float:left;
		width:816px;
		line-height:56px;
		font-size:36px;
		font-family: PingFangSC-Regular;
        color: #08BF69;
		margin:16px 0 24px 0;
	}
	.p3{
		float:left;
		width:816px;
		line-height:32px;
		font-size:20px;
		font-family: PingFangSC-Regular;
        color: #999999;
	}
	.content_bottom{
		width:1072px;
		margin-top:40px;
	}
	.content_bottom img{
		width:1072px;
		margin-bottom:16px;
	}
</style>

</head>

<body>
<div class="mean">
	<div class="head">
		<img src="http://yubaopay.oss-cn-hongkong.aliyuncs.com/images/14444080183464.jpg" class="logo"/>
		<img src="http://yubaopay.oss-cn-hongkong.aliyuncs.com/images/11006012922637.jpg" class="slogen"/>
	</div>
	<div class="content">
    	<div class="content_head">
    		<img src="http://yubaopay.oss-cn-hongkong.aliyuncs.com/images/6778641964630.jpg" class="order"/>
    		<p class="p1">订单号：${billObject.billID}</p>
			<p class="p2">您有一个交易已被处理</p>
			<p class="p3">交易提示：汇款证明截图，请您及时确认</p>
		</div>
		<div class="content_bottom">
			${resultArray}
		</div>
	</div>
</div>
</body>
</html>
`);

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

                        userAccountModel.updateOne({email_address: email_address}, {$set: {password: hashedPassword}},
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

            userAccountModel.updateOne({uuid: req.use.uuid}, {$set: {email_address: email_address}}, function (err) {
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