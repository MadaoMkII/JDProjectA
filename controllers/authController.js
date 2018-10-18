const passport = require('passport');
const logger = require('../logging/logging').logger;
const userModel = require('../modules/userAccount').userAccountModel;
exports.logoutUser = (req, res) => {
    if (req.user) {

        req.logout();
        return res.status(200).json({error_code: 0, error_msg: 'logout succeeded'});
    } else {
        return res.status(406).json({error_code: 406, error_msg: 'need login first'});
    }
};

exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (req.user) {

            req.logout();
        }
        if (err) {
            logger.error('\'Response code:401, message: Login faild\'+' +
                '`Error location : Class: authController, function: loginUser. ' + err);

            return res.status(401).json({error_code: 401, error_msg: 'Login faild'});// will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {

            return res.status(401).json({
                error_code: 401, error_msg:
                    'Authentication failed, please check username and password'
            });
        }
        req.login(user, (err) => {
            if (err) {
                logger.error('Error location : Class: authController, function: loginUser. ' + err);
                return next(err);
            }
            let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            logger.info(req.user.tel_number + ' has been login in. IP is ' + ip);
            userModel.update({tel_number: req.user.tel_number}, {$set: {last_login_time: Date.now()}}, (err) => {
                if (err) {

                    return res.status(404).json({error_code: 404, error_msg: 'Can not find anything'});
                }

            });
            // if (req.user.role === `Admin` || req.user.role === `Super_Admin`) {
            //    return res.redirect(301, 'http://www.yubaopay.com.tw/administrator_appeal');
            // }
            return res.status(200).json({
                "error_code": 0,
                "data": {
                    "TEL": user.tel_number,
                    "role": user.role,
                    "last_login_time": user.last_login_time
                }
            });
        }, null);
    })(req, res, next);
};
//tool function translates Privilege to amount
let getPrivilege = (privilegeName) => {
    let privilege = 0;
    switch (privilegeName) {
        case 'Admin':
            privilege = 30;
            break;
        case 'Super_Admin':
            privilege = 50;
            break;
        case 'User':
            privilege = 10;
            break;
        case 'All':
            privilege = 0;
            break;
        default:
            privilege = -1;

    }
    return privilege;
};
//check if user has been login though passport
//check if the request has enough privilege for a certain API
exports.isAuthenticated = (privilegeName) => {

    return (req, res, next) => {

        if (req.user) {
            if (req.user.role !== null && getPrivilege(req.user.role) < getPrivilege(privilegeName)) {
                return res.status(403).json({error_code: 403, error_msg: 'Insufficient privilege'})
            }
            return next();
        } else {

            return res.status(401).json(
                {error_code: 401, error_msg: 'Authentication failed, need login first'}
            );
        }
    }
};
