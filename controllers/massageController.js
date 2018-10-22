const redis = require("redis"),
    redisClient = redis.createClient();
const {promisify} = require('util');
//const regex = /^(09)[0-9]{8}$/;
const MessageXSend = require('../lib/SUBMAIL/intersmsXsend');
const message = new MessageXSend();
const logger = require('../logging/logging').logger;
const tools = require("../config/tools");
/**
 * 发送短信验证
 * @param req
 * @param res
 * @param category
 * @param resultValue
 */
exports.shin_smsSend = async (req, res, category, resultValue) => {
    try {
        const tel_number = req.body.tel_number;
        if (tools.isEmpty(tel_number)) {
            return res.status(400).json({
                error_msg: "tel_number can not be null",
                error_code: "400"
            });
        }
        let wanwan_phone_reg = /^((?=(09))[0-9]{10})$/;
        if (!wanwan_phone_reg.test(tel_number)) {
            return res.status(400).json({
                error_msg: "Wrong cell phone number",
                error_code: "400"
            });
        }

        let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
        let key = `category:${category},verity_code:${verity_code}`;
        let existsResult = await redisClient.exists(key);
        if (existsResult === 1) {
            return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
        }

        // let foundUser = await userAccountModel.findOne({tel_number: tel});
        // if (foundUser) {
        //     return res.status(208).json({
        //         error_msg: "This tel number has already been registered yet",
        //         error_code: "208"
        //     });
        // }

        message.set_to(tel_number);
        message.set_project('WnDSX2');
        message.add_var('code', verity_code);
        message.add_var('time', '1分鐘');
        //await message.xsend();

        //限制访问频率60秒
        await redisClient.set(key, resultValue, 'EX', 3600, redis.print);

        return res.json({
            error_msg: "OK",
            error_code: "0",
            verificationCode: verity_code
        });

    } catch (err) {
        logger.error("shin_smsSend", {
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
// exports.smsSend = async (req, res) => {
//     try {
//         const tel = req.body.tel;
//         let wanwan_phone_reg = /^((?=(09))[0-9]{10})$/;
//         if (!wanwan_phone_reg.test(tel)) {
//             return res.status(400).json({
//                 error_msg: "Wrong cell phone number",
//                 error_code: "400"
//             });
//         }
//         let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
//         let foundUser = await userAccountModel.findOne({tel_number: tel});
//         if (foundUser) {
//             return res.status(208).json({
//                 error_msg: "This tel number has already been registered yet",
//                 error_code: "208"
//             });
//         }
//
//         let result = await redisClient.exists("registerNumber:" + tel);
//         if (result === 1) {
//             return res.status(405).json({error_msg: "Too many tries at this moment", error_code: "405"});
//         }
//         message.set_to(tel);
//         message.set_project('WnDSX2');
//         message.add_var('code', verity_code);
//         message.add_var('time', '1分鐘');
//         await message.xsend();
//
//         //限制访问频率60秒
//         await redisClient.multi().set('registerNumber:' + tel, verity_code, 'EX', 1000);
//         return res.json({
//             error_msg: "OK",
//             error_code: "0",
//             verificationCode: verity_code
//         });
//
//     } catch (err) {
//         logger.error("smsSend", {
//             level: req.user.role,
//             response: `Internal Service Error`,
//             location: (new Error().stack).split("at ")[1],
//             body: req.body,
//             error: err
//         });
//         return res.status(503).json({
//             error_msg: "Internal Service Error",
//             error_code: "503"
//         });
//     }
//
//
// };

/**
 * 检验验证码
 * @param req
 * @param res
 * @param category
 * @param resultValue
 */
exports.check_code = async (req, res, category, resultValue) => {


        let verity_code = req.body.code;
        if (tools.isEmpty(verity_code)) {

            throw new Error("code can not be empty");

        }
        let key = `category:${category},verity_code:${verity_code}`;

        const getAsync = promisify(redisClient.get).bind(redisClient);
        let result = await getAsync(key);

        return !(!result || result !== resultValue);
        s
};


exports.confirm_smsMassage = async (req, res, category) => {

    try {
        let code = req.body.code;
        let tel_number = req.body.tel_number;

        let result = await redisClient.get(`category:${category},tel_number:${tel_number}`);
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }
        if (parseInt(code) === parseInt(result)) {

            await  redisClient.multi().set('registerNumber:' + tel_number, "OK", 'EX', 3600);

            return res.status(200).json({error_msg: "Massage has been confirmed", error_code: "0"});
        } else {
            return res.status(404).json({error_msg: "Verification code Wrong", error_code: "404"});
        }
    } catch (err) {
        return res.status(503).json({
            error_msg: "Internal Service Error",
            error_code: "503"
        });
    }

};

