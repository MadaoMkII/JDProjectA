const passport = require('passport');
const logger = require('../logging/logger');

exports.logoutUser = (req, res) => {
    if (req.user) {
        logger.debug(req.user + ' has been logout for new loggin');
        req.logout();
        return res.status(200).json({success: true, message: 'logout succeeded'});
    } else {
        return res.status(406).json({success: false, message: 'need login first'});
    }
};

exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (req.user) {
            logger.debug(req.user + ' has been logout for new login');
            req.logout();
        }
        if (err) {
            logger.trace(req.body);
            logger.error('Error location : Class: authController, function: loginUser. ' + err);
            logger.error('Response code:401, message: Login faild');
            return res.status(401).json({success: false, message: 'Login faild'});// will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {
            logger.error('Error location : Class: authController, function: loginUser. ' + err);
            logger.error('Response code:401, message: Authentication faild, please check username and password');
            return res.status(401).json({
                success: false, message:
                    'Authentication faild, please check username and password'
            });
        }
        req.login(user, (err) => {
            if (err) {
                logger.error('Error location : Class: authController, function: loginUser. ' + err);
                return next(err);
            }
            return res.status(200).json({
                "error_code": 0,
                "data": {
                    "username": user.username,
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
        case 'Agent':
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

    return function (req, res, next) {

        if (req.user) {
            if (req.user.role !== null && getPrivilege(req.user.role) < getPrivilege(privilegeName)) {
                return res.status(403).json({success: false, message: 'Insufficient privilege'})
            }
            return next();
        } else {
            return res.status(401).json(
                {success: false, message: 'Authentication failed, need login first'}
            );
        }
    }
};
