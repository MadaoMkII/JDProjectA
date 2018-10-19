const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const userController = require('./controllers/userController');
//const debug = require('debug')('http');
const mailController = require('./controllers/mailController');
const isAuthenticated = require('./controllers/authController').isAuthenticated;
const loginUser = require('./controllers/authController');
const massageChecker = require('./controllers/massageController');
const picController = require('./controllers/picController');
const advertisingController = require('./controllers/advertisingController');
const rechargeController = require('./controllers/rechargeController');
const appealFormController = require('./controllers/appealFormController');
const manageSettingController = require('./controllers/manageSettingController');
const announcementController = require('./controllers/annuouncementController');
const processOrderController = require('./controllers/processOrderController');
const dgPayment = require('./controllers/dgPayment');
const bodyParser = require('body-parser');
const session = require('express-session');


const json_body_parser = bodyParser.json();
const urlencoded_body_parser = bodyParser.urlencoded({extended: true});

let app = express();


//
app.options(`http://www.yubaopay.com.tw`, cors());
app.use(json_body_parser);
app.use(urlencoded_body_parser);
app.use(session({
    secret: 'abc', resave: true,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
// Add headers
app.use(function (req, res, next) {

    let allowedOrigins = ['http://www.yubaopay.com.tw', 'http://localhost:8080'];
    let origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', `*`);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        // Pass to next layer of middleware
        next();
    }
});
// In middleware
app.use(function (req, res, next) {

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

app.get('/dujiuxing', isAuthenticated('User'), manageSettingController.dujiuxing);

app.post('/user/updatePassword', isAuthenticated('User'), userController.update_password);
app.post('/msg/updatePasswordSendMassage', isAuthenticated('User'), userController.update_password_sendMassage);

app.post('/msg/updatePhoneNumber', isAuthenticated('User'), userController.update_phoneNumber);
app.post('/user/updatePhoneNumberSendMassage', isAuthenticated('User'), userController.update_phoneNumber_sendMassage);

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
app.post('/addProcessOrderForCharge', isAuthenticated('User'), processOrderController.addProcessOrderForRcoinCharge);
app.post('/setReferer', isAuthenticated('User'), userController.setReferer);
app.post('/addUserRealName', isAuthenticated('User'), userController.addUserRealName);
app.post('/setBaseRate', isAuthenticated('User'), dgPayment.setBaseRateOutside);
app.get('/getBaseRate', isAuthenticated('User'), dgPayment.getBaseRateOutside);

app.post('/delbank', isAuthenticated('User'), userController.delUserBank);
app.post('/addbank', isAuthenticated('User'), userController.addUserBank);
app.post('/addBankAccounts', isAuthenticated('Super_Admin'), manageSettingController.addBankAccounts);
app.get('/getBankAccounts', isAuthenticated('User'), manageSettingController.getBankAccounts);

app.post('/getThisUserRate', isAuthenticated('User'), dgPayment.getThisUserRcoinRate);
app.post('/getBills', isAuthenticated('Admin'), dgPayment.adminGetBills);

app.post('/addProcessOrder', isAuthenticated('Admin'), processOrderController.addProcessOrder);
app.post('/addReplacePostageBill', isAuthenticated('User'), dgPayment.addReplacePostageBill);
app.post('/payReplacePostage', isAuthenticated('User'), dgPayment.payReplacePostage);
app.post('/addRcoinsBill', isAuthenticated('User'), dgPayment.addDGRcoinsBill);

//app.post('/addAnotherBill', isAuthenticated('User'), dgPayment.addDGByALIBill);

app.post('/addAnnouncement', isAuthenticated('SAdmin'), announcementController.addAnnouncement);
app.post('/findAnnouncement', isAuthenticated('Admin'), announcementController.findAnnouncement);
app.post('/updateAnnouncement', isAuthenticated('Admin'), announcementController.updateAnnouncement);
app.post('/delAnnouncement', isAuthenticated('Admin'), announcementController.delAnnouncement);

app.get('/getAppealIssues', isAuthenticated('Admin'), manageSettingController.getAppealTopics);
app.get('/process', picController.getImgs);
app.get('/appeal', picController.getImgs);
app.get('/adv', picController.getImgs);

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
app.get('/delImage/:filename', isAuthenticated('Admin'), picController.deleteImpsForController);
app.post('/setSetting', isAuthenticated('Super_Admin'), manageSettingController.setSetting);
app.get('/getSetting', isAuthenticated('User'), manageSettingController.getSetting);
app.get('/get3level', isAuthenticated('User'), manageSettingController.find3L);
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

app.post('/addRcoinChargeBill', isAuthenticated('User'), rechargeController.addRcoinChargeBills);
app.post('/addChargeBill', isAuthenticated('User'), rechargeController.addChargeBills);
app.post('/findChargeBill', isAuthenticated('User'), rechargeController.findMyChargeBills);
app.post('/msg/send_massage', massageChecker.smsSend);

app.post('/msg/check_massage', massageChecker.check_code);

app.post('/mail/send_mail', mailController.sendConfirmationEmail);
app.post('/mail/check_mail', mailController.checkConfirmationEmail);
app.post('/mail/getbackmail', mailController.getBackFromEmail);

//app.post('/sendemail', mailController.sendConfirmationEmail);//done


app.get('/user/getInfo', isAuthenticated('User'), userController.getUserInfo);


app.post('/signup', userController.userSignUp);

app.post('/user/login', loginUser.loginUser);
app.post('/user/logout', loginUser.logoutUser);

app.listen(3000);


process.on('uncaughtException', (err) => {
    console.error(err);
});

process.on('unhandledRejection', (reason, p) => {
    console.error(reason, p);
});


console.log("Begin Server");
