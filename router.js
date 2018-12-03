const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const paybackController = require('./controllers/paybackController');
const userController = require('./controllers/userController');
const weChatController = require('./controllers/weChatController');
const alipayController = require('./controllers/alipayController');
//const debug = require('debug')('http');
const isAuthenticated = require('./controllers/authController').isAuthenticated;
const loginUser = require('./controllers/authController');
const mailController = require('./controllers/mailController');
//const massageChecker = require('./controllers/massageController');
const picController = require('./controllers/picController');
const advertisingController = require('./controllers/advertisingController');
const rechargeController = require('./controllers/rechargeController');
const appealFormController = require('./controllers/appealFormController');
const manageSettingController = require('./controllers/manageSettingController');
const announcementController = require('./controllers/annuouncementController');
const processOrderController = require('./controllers/processOrderController');
const dgPayment = require('./controllers/dgPayment');
const bodyParser = require('body-parser');
const bodyParserXML = require('body-parser');
require('body-parser-xml')(bodyParserXML);
const session = require('express-session');


const json_body_parser = bodyParser.json();
const urlencoded_body_parser = bodyParser.urlencoded({extended: true});

let app = express();


//解析xml
app.use(bodyParserXML.xml({
    limit: '1MB',   // Reject payload bigger than 1 MB
    xmlParseOptions: {
        normalize: true,     // Trim whitespace inside text nodes
        normalizeTags: true, // Transform tags to lowercase
        explicitArray: false // Only put nodes in array if >1
    }
}));


app.options(`http://www.yubaopay.com.tw`, cors());
app.use(json_body_parser);
app.use(urlencoded_body_parser);
app.use(session({
    secret: 'abc', resave: true,
    cookie: {_expires: 60000000},
    saveUninitialized: true
}));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
// Add headers
app.use((req, res, next) => {
    //
    let allowedOrigins = ['http://www.yubaopay.com.tw', `http://47.244.143.129:3000`, 'http://localhost:8080'];
    let origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Website you wish to allow to connect
    //buyao res.setHeader('Access-Control-Allow-Origin', `*`);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    //res.setHeader("Content-Type", 'application/json');


    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        // Pass to next layer of middleware
        next();
    }
});
// In middleware
app.use(function (req, res, next) {


    // var schedule = require("node-schedule");
    //
    // var rule1 = new schedule.RecurrenceRule();
    // var times1 = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
    // rule1.second = times1;
    // schedule.scheduleJob(rule1, function () {
    //
    //     console.log(14213)
    // });

    // action after response
    let afterResponse = function () {

        // any other clean ups
        // mongoose.connection.close(function () {
        //     console.log('Mongoose connection disconnected');
        // });
    };

    // hooks to execute after response
    res.on('finish', afterResponse);
    res.on('close', afterResponse);

    // do more stuff

    next();
});
// Configure the Basic strategy for use by Passport.
//
// The Basic strategy requires a `verify` function which receives the
// credentials (`username` and `password`) contained in the request.  The
// function must verify that the password is correct and then invoke `cb` with
// a user object, which will be set at `req.user` in route handlers after
// authentication.
// Create a new Express application.
// Configure Express application.

app.get('/payback/getFavorites', paybackController.getFavorites);
app.get('/testErr', isAuthenticated('Admin'), advertisingController.errorTest);
app.get('/test', isAuthenticated('Admin'), weChatController.jiade);

app.get('/alipay/receiveCallback', alipayController.receiveCallback);
app.get('/alipay/setAccount', isAuthenticated('Admin'), alipayController.set_AlipayAccount);

app.get('/alipay/QRcode', isAuthenticated('User'), alipayController.get_alipay_QR_code);
app.get('/wechat/getQRcodeUrl', isAuthenticated('User'), weChatController.getQR_code_link);

app.post('/receive', weChatController.msg_holder);

app.post('/wechat/checkToken', weChatController.msg_holder);
app.post('/recharge/returnRcoin', isAuthenticated('Admin'), processOrderController.returnRcoin);

app.post('/getPostage', isAuthenticated('Admin'), processOrderController.getAlreadySolved);

app.get('/dujiuxing', isAuthenticated('User'), manageSettingController.dujiuxing);

app.post('/user/updateNickname', isAuthenticated('User'), userController.update_nickName);
app.post('/user/updatePassword', isAuthenticated('User'), userController.update_password);

app.post('/user/updateEmail', isAuthenticated('User'), userController.update_email);
app.get('/msg/updateEmailMassage', isAuthenticated('User'), userController.update_email_sendMassage);

app.post('/user/getBackUpdate', userController.getBack_password_update);
app.post('/msg/getBackSendMassage', userController.getBack_password_sendMassage);

app.get('/msg/currentSendMassage', isAuthenticated('User'), userController.old_Number_sendMassage);
app.post('/user/verifySendMassage', isAuthenticated('User'), userController.old_Number_check_code);

app.post('/user/setNickname', isAuthenticated('User'), userController.old_Number_check_code);

app.post('/user/updatePhoneNumber', isAuthenticated('User'), userController.update_phoneNumber);
app.post('/msg/updatePhoneNumberSendMassage', isAuthenticated('User'), userController.update_phoneNumber_sendMassage);

app.post('/adv/addHomepageItems', isAuthenticated('Admin'), advertisingController.addHomepageItems);
app.post('/adv/getHomepageItems', advertisingController.getHomepageItems);
app.post('/adv/getHomepageItemsList', advertisingController.getHomepageItemsList);
app.post('/adv/setDFpage', isAuthenticated('Admin'), advertisingController.setDFpage);
app.get('/adv/getDFpage', advertisingController.getDFpage);
app.post('/adv/setHomepage', advertisingController.setHomepage);
app.get('/adv/getHomepage', advertisingController.getHomepage);

app.post('/findUserReferer', isAuthenticated('User'), userController.findUserReferer);

app.post('/uploadImgForEndpoint', isAuthenticated('User'), picController.uploadImgForEndpoint);
app.post('/setUserRole', isAuthenticated('Super_Admin'), userController.setUserRole);
app.post('/zhuceSuperAdmin', userController.zhuce);
app.post('/findUser', isAuthenticated('User'), userController.findUser);
app.post('/findThisUserRcoinRecord', isAuthenticated('User'), dgPayment.findThisUserRcoinRecord);

app.post('/getDataAnalyst', isAuthenticated('User'), processOrderController.getDataAnalyst);

app.post('/setReferer', isAuthenticated('User'), userController.setReferer);
app.post('/addUserRealName', isAuthenticated('User'), userController.addUserRealName);

app.post('/bill/getBaseRate', isAuthenticated('User'), dgPayment.getThisUserBasicRate);

app.post('/user/delAliPayAccount', isAuthenticated('User'), userController.delUserAliPayAccounts);
app.post('/user/delUserWechat', isAuthenticated('User'), userController.delUserWechat);
app.get('/user/addUserBankSendMassage', isAuthenticated('User'), userController.addUserBank_sendMassage);
app.post('/user/delBank', isAuthenticated('User'), userController.delUserBank);
app.post('/user/addBank', isAuthenticated('User'), userController.addUserBank);
app.post('/addBankAccounts', isAuthenticated('Super_Admin'), manageSettingController.addBankAccounts);
app.get('/getBankAccounts', isAuthenticated('User'), manageSettingController.getBankAccounts);

app.post('/getThisUserRate', isAuthenticated('User'), dgPayment.getThisUserRcoinRate);
app.post('/bills/getBills', isAuthenticated('Admin'), dgPayment.adminGetBills);
app.post('/bills/findMyBills', isAuthenticated('Admin'), dgPayment.findMyBills);
app.post('/bills/getBillDetail', isAuthenticated('Admin'), rechargeController.getChargeBillDetail);
app.post('/bills/setBillStatus', isAuthenticated('Admin'), processOrderController.setOrderStatus);

app.get('/bills/getFriendAccount', dgPayment.getFriendAccount);

app.post('/bills/findPostage', isAuthenticated('Admin'), dgPayment.findPostage);

app.post('/item/addReplacePostageBill', isAuthenticated('Admin'), dgPayment.addReplacePostageBill);
app.post('/item/payReplacePostage', isAuthenticated('User'), dgPayment.payReplacePostage);

app.get('/announcement/getModel', announcementController.getModel);
app.post('/announcement/removeModel', announcementController.removeModel);
app.post('/announcement/addModel', announcementController.addModel);
app.post('/announcement/updateModel', announcementController.updateModel);

app.post('/announcement/addHelpCenterAnnouncement', announcementController.addHelpCenterAnnouncement);
app.get('/announcement/getHelpCenterAnnouncement', announcementController.getHelpCenterAnnouncement);
app.post('/announcement/updateHelpCenterAnnouncement', announcementController.updateHelpCenterAnnouncement);

app.post('/announcement/addCommonAnnouncement', announcementController.addAnnouncement);
app.post('/announcement/findCommonAnnouncement', announcementController.findAnnouncement);
app.post('/announcement/updateCommonAnnouncement', announcementController.updateAnnouncement);
app.post('/announcement/delCommonAnnouncement', announcementController.delAnnouncement);

app.get('/getAppealIssues', isAuthenticated('Admin'), manageSettingController.getAppealTopics);

app.post('/appealForm/getAppealFormById', isAuthenticated('User'), appealFormController.getAppealFormById);
app.get('/appealForm/getMyAppealForm', isAuthenticated('User'), appealFormController.getMyAppealForm);
app.post('/appealForm/addAppealForm', isAuthenticated('User'), appealFormController.addAppealForm);
app.post('/appealForm/findAppealForm', isAuthenticated('Admin'), appealFormController.findAppealForm);
app.post('/appealForm/setResponseAppealForm', isAuthenticated('Admin'), appealFormController.setResponseAppealForm);
app.post('/appealForm/delAppealForm', isAuthenticated('Admin'), appealFormController.delAppealForm);


app.post('/delAdvertising', isAuthenticated('Admin'), advertisingController.delAdvertising);

app.get('/index', picController.getImgs);
app.get('/image/:filename', picController.findImgById);
app.post('/upload', isAuthenticated('User'), appealFormController.addAppealForm);
app.post('/delImage', isAuthenticated('Admin'), picController.deleteImgs_new);
app.post('/setSetting', isAuthenticated('Super_Admin'), manageSettingController.setSetting);
app.get('/getSetting', isAuthenticated('User'), manageSettingController.getSetting);
app.get('/get3level', isAuthenticated('User'), manageSettingController.find3L);
app.post('/update3level', isAuthenticated('User'), manageSettingController.set3L);
app.get('/checkhealth', function (req, res) {
    if (req.user) {
        if (req.user.role === `Admin` || req.user.role === `Super_Admin`) {
            return res.redirect(301, 'http://www.baidu.com');
        }
        return res.status(200).json({
            success: true,
            message: req.user
        });
    } else {
        return res.status(200).json({
            success: true,
            message: 'Server is running, but you need to login'
        });
    }
});
app.post('/getSetting', isAuthenticated('User'), manageSettingController.getSetting);
app.post('/setSetting', isAuthenticated('User'), manageSettingController.setSetting);

app.post('/item/addProcessOrder', isAuthenticated('Admin'), processOrderController.addProcessOrder);
app.post('/item/addBillByRcoins', isAuthenticated('User'), dgPayment.addDGRcoinsBill);
app.post('/item/addBillByBank', isAuthenticated('User'), dgPayment.addBillByBank);

app.post('/recharger/addProcessOrderForCharge', isAuthenticated('Admin'), processOrderController.addProcessOrderForCharge);
app.post('/recharger/addRcoinChargeBill', isAuthenticated('User'), rechargeController.addRcoinChargeBills);
app.post('/recharger/addChargeAliBill', isAuthenticated('User'), rechargeController.addChargeAliBills);
app.post('/recharger/findChargeBill', isAuthenticated('User'), rechargeController.findMyChargeBills);
app.post('/recharger/addChargeWechatBills', isAuthenticated('User'), rechargeController.addChargeWechatBills);
app.post('/recharger/addChargeAliBills', isAuthenticated('User'), rechargeController.addChargeAliBills);
//
// app.post('/mail/send_mail', mailController.sendConfirmationEmail);
// app.post('/mail/change_Email', mailController.checkConfirmationEmail);
// app.post('/mail/getbackmail', mailController.getBackFromEmail);


app.post('/user/setEmployee', isAuthenticated('User'), userController.setEmployee);
app.post('/mail/send_pic_mail', isAuthenticated('User'), mailController.func_send_Email);//done


app.get('/user/getInfo', isAuthenticated('User'), userController.getUserInfo);

app.post('/msg/send_sign_massage', userController.user_signUp_sendMassage);
app.post('/msg/check_sign_massage', userController.user_signUp_check_code);
app.post('/user/signup', userController.userSignUp);

app.post('/user/login', loginUser.loginUser);
app.get('/user/logout', loginUser.logoutUser);

app.listen(3000);


process.on('uncaughtException', (err) => {
    console.error(err);
});

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, p);
});


console.log("Begin Server");
