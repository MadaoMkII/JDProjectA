const passport = require('passport');
const config = require('../config/develop');
const userAccountModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logging');
const LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function (user, callback) {

    callback(null, user.tel_number);
});

passport.deserializeUser(function (username, callback) {

        userAccountModel.findOne({tel_number: username}, function (err, user) {
            callback(err, user);
        });
    }
);
passport.use(new LocalStrategy('local', (username, password, callback) => {

        let email_reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        let wanwan_phone_reg = /^((?=(09))[0-9]{10})$/;
            ///^1(3|4|5|7|8)\d{9}$/;

        let command = {};

        if (username) {

            if (email_reg.test(username)) {
                command['email_address'] = username;

            } else if (wanwan_phone_reg.test(username)) {
                command['tel_number'] = username;

            } else{

                return callback(null, false);
            }
        }

        command['password'] = require('crypto').createHash('md5').update(password + config.saltword).digest('hex');

        userAccountModel.findOne(command, (err, data) => {

            if (err) {
                logger.error('passport: passport.use ' + err);
                return callback(err, false);
            }
            if (!data) return callback(null, false);

            return callback(err, data);
        })

    }
));
module.exports = passport;