const logger = require('../logging/logger');
const nodemailer = require('nodemailer');
const config = require('../config/develop');

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


exports.sendEmail = (req, res) => {

    let recipients = "";
    for (let recipient of req.body.recipients) {
        recipients += recipient + ',';
    }
    let mailOptions = {
        from: '报单提醒系统<baodan@usaboluo.com>', // sender address
        to: recipients, // list of receivers
        subject: req.body.subject, // Subject line
        text: '', // plain text body
        html: '<b>' + req.body.subject + '</b>  <td id="QQMAILSTATIONERY" ' +
        'style="background:url(https://rescdn.qqmail.com/zh_CN/htmledition/images/xinzhi/bg/b_01.jpg);' +
        ' min-height:550px; padding:100px 55px 200px; ">' +
        '<div>' + req.body.content + '</div></td>' // html body
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

