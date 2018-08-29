const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const userController = require('./controllers/userController');
const thirdPayment = require('./controllers/thirdPayment');
const mailController = require('./controllers/mailController');
const isAuthenticated = require('./controllers/authController').isAuthenticated;
const loginUser = require('./controllers/authController');
const massageChecker = require('./controllers/massageController');
const billStatement = require('./controllers/billStatementController');
const picController = require('./controllers/picController');
const advertisingController = require('./controllers/advertisingController');
const rechargeController = require('./controllers/rechargeController');
const appealFormController = require('./controllers/appealFormController');
const manageSettingController = require('./controllers/manageSettingController');


const bodyParser = require('body-parser');
const session = require('express-session');


const json_body_parser = bodyParser.json();
const urlencoded_body_parser = bodyParser.urlencoded({extended: true});

let app = express();

const DOMAIN = 'http://localhost:8080';
//
app.options(DOMAIN, cors());
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

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', DOMAIN);

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

app.get('/appeal', picController.getImgs);
app.post('/addAppealForm', appealFormController.addAppealForm);
app.post('/getAppealForm', appealFormController.getAppealForm);
app.post('/setResponseAppealForm', appealFormController.setResponseAppealForm);

app.get('/index', picController.getImgs);
app.get('/image/:filename', picController.findImgById);
app.post('/upload', appealFormController.addAppealForm);
app.get('/delImage/:filename', picController.deleteImpsForController);
app.post('/setSetting', manageSettingController.setSetting);
app.get('/getSetting', manageSettingController.getSetting);
app.get('/checkhealth', isAuthenticated('User'), function (req, res) {
    if (req.user) {
        return res.status(200).json({
            success: true,
            message: 'Login successful! ' + 'Your role is : ' + req.user.role +
            '  Your username is : ' + req.user.username
        });
    } else {
        return res.status(200).json({
            success: true,
            message: 'Server is running, but you need to login'
        });
    }
});
app.post('/getSetting', manageSettingController.getSetting);
app.post('/setSetting', manageSettingController.setSetting);
app.post('/ceshi', rechargeController.addRcoinChargeBills);
app.post('/ceshi2', rechargeController.addChargeBills);
// app.post('/upload', picController.upload);
app.post('/msg/send_massage', massageChecker.smsSend);
app.post('/msg/check_massage', massageChecker.check_code);

app.post('/mail/send_mail', mailController.sendConfirmationEmail);
app.post('/mail/check_mail', mailController.checkConfirmationEmail);
app.post('/mail/getbackmail', mailController.getBackFromEmail);

//app.post('/sendemail', mailController.sendConfirmationEmail);//done
app.post('/user/updatePhoneNumber', isAuthenticated('User'), userController.updatePhoneNumber);
app.post('/user/updateGeneral', isAuthenticated('User'), userController.updateGeneralData);//done
app.post('/user/updatePassword', isAuthenticated('User'), userController.update_password);
app.get('/user/getInfo', isAuthenticated('User'), userController.getUserInfo);
app.post('/user/addReferenceAccount', isAuthenticated('User'), userController.addReferenceAccount);
app.post('/user/updateReferenceAccount', isAuthenticated('User'), userController.updateReferenceAccount);


app.delete('/bill/delBill', isAuthenticated('User'), billStatement.deleteBills);
app.post('/bill/getBills', isAuthenticated('User'), thirdPayment.getBills);


app.post('/bill/addCZBill', thirdPayment.addCZBill);
app.post('/bill/createTBBill', isAuthenticated('User'), thirdPayment.addTBDFBill);

app.post('/signup', userController.userSignUp);

app.post('/login', loginUser.loginUser);
app.post('/logout', loginUser.logoutUser);

app.listen(3000);
console.log("Begin Server");
