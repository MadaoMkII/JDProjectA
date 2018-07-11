const redis = require("redis"),
    redisClient = redis.createClient();
const userAccountModel = require('../modules/userAccount').userAccountModel;
const regex = "/^(09)[0-9]{8}$/";
const MessageXSend = require('../lib/SUBMAIL/messageXSend');
const message = new MessageXSend();


/**
 * 发送短信验证
 * @param req
 * @param res
 */
exports.smsSend = (req, res) => {
    const tel = req.body.tel;
    //if (!tel || !regex.exec(tel)) return res.json({errMsg: "tel is no true", errCode: "400"});
    //生成6位数字的随机数
    let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
    //检查用户是否已经注册
    userAccountModel.findOne({tel: tel}).exec().then((err, user) => {
        if (user) {
            return res.status(208).json({
                error_msg: "This tel_number has already been registered yet",
                error_code: "208"
            });
        }

        redisClient.exists("registerNumber:" + tel, function (err, result) {
            if (err) {
                return res.status(503).json({error_msg: "Internal Service Error", error_code: "503"});
            }
            if (result === 1) {
                return res.status(403).json({error_msg: "Too many tries at this moment", error_code: "403"});
            } else {
                console.log(tel);
                message.set_to(tel);
                message.set_project('S2ID91');
                message.add_var('code', verity_code);
                message.add_var('time', '60sec');
                message.xsend(() => {
                    console.log("!!!!!!!!!!!!!");
                    if (!err) {
                        //发送成功
                        let multi = redisClient.multi();
                        //限制访问频率60秒
                        multi.set('registerNumber:' + tel, verity_code, 'EX', 1000)
                            .exec(function (err, replies) {
                                if (err) {
                                    return res.status(503).json({
                                        error_msg: "Internal Service Error",
                                        error_code: "503"
                                    });
                                } else {
                                    console.log({error_msg: "Already sent", error_code: replies});
                                    return res.json({error_msg: "Already sent verification code", error_code: "0"});
                                }

                            });
                    }
                })
            }
        });
    })
};
/**
 * 检验验证码
 * @param req
 * @param res
 */
exports.check_code = function (req, res) {
    let code = req.body.code;
    let tel = req.body.tel;
    redisClient.get("registerNumber:" + tel, function (err, result) {

        if (err) return res.status(500).json({error_msg: "Internal Server Error", error_code: "500"});
        //服务器不存在校验码或已被删除
        if (!result) {
            return res.status(404).json({error_msg: "No verification code", error_code: "404"});
        }

        if (parseInt(code) === parseInt(result)) {
            return res.status(200).json({error_msg: "Ok", error_code: "0"});
        } else {
            return res.status(404).json({error_msg: "No verification code found", error_code: "404"});
        }
    });
};


// function register(req, res) {
//     let data = req.body;
//     if (!data || !data.tel || !data.password || !data.code || !regx.exec(data.tel)) return res.json({
//         errMsg: "请输入有效内容",
//         errCode: "400"
//     });
//     redisClient.get("code:" + data.tel, function (err, result) {
//         if (err) return res.json({errMsg: "服务器出错，请重试", errCode: "500"});
//         if (result != data.code) return res.json({errMsg: "验证码不一致", errCode: "1"});
//         //通过短信校验
//         var user = {
//             tel: data.tel,
//             password: data.password
//         };
//         User.create(user).exec(function createCB(err, createUser) {
//             if (err) {
//                 return res.json({errMsg: "服务器出错，创建失败", errCode: 500});
//             }
//             if (!err) {
//                 req.session.objectid = createUser.id;
//                 return res.json({errMsg: "ok", errCode: 0});
//             }
//             //清除缓存数据
//             redisClient.del("code:" + data.tel);
//         });
//     });
// }
