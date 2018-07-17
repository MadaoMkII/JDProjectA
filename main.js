// var redis = require("redis"),
//     redisClient = redis.createClient();
//
//
// redisClient.exists("register:" + 123, function (err, result) {
//     if (err) console.log({errMsg: "服务器出错，请重试", errCode: "500"});
//     if (result === 1) return console.log(result);
//     let tel = 123321344341;
//     //发送短信
//     let verity_code = Math.floor(Math.random() * (999999 - 99999 + 1) + 99999);
//     //限制访问频率60秒
//     var multi = redisClient.multi();
//     //限制访问频率60秒
//     multi.set('tel:' + tel, verity_code, 'EX', 30).hmset("code:" + verity_code,
//        "verity_code", verity_code, "count", 0).INCRBYFLOAT("code:" + "123",5).exec(function (err, replies) {
//         if (!err) return console.log({errMsg: "ok", errCode: 0});
//     });
// //发送成功
// redisClient.multi()
// //限制访问频率60秒
// .set('key', 'value!', 'EX', 10).
//     hset("code:" + "123", "code","!bvs")
//     .hset("code:" + "123","count",0)
//     .exec(function (err, replies) {
//         if (!err)return console.log({errMsg: "ok", errCode: 0});
//     });
// console.log(123===parseInt("123"));
//     multi.exec(function (err, replies) {
//         console.log(replies); // 101, 2
//         redisClient.quit();
//     });
//
// });

//
// var MessageXSend = require('./lib/SUBMAIL/messageXSend');
// var message = new MessageXSend();
//
// message.set_to('15620304097');
// message.set_project('S2ID91');
// message.add_var('code', '9527');
// message.add_var('time', '9年');
// message.xsend(()=>{
//     console.log("!!!!!!!!!!!!!");
// });
// var randomstring = Math.random().toString(36).slice(-11);
// console.log(randomstring);


function f(obj) {
    obj.name = "NINI";
    obj = new Object();
    obj.name = "Greg";
}

let person = {};
f(person);
console.log((Math.random() * Date.now()*10).toFixed(0));