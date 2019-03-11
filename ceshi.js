// var express = require('express');
// //
// // // This line is from the Node.js HTTPS documentation.
// //
// // const https = require("https"),
// //     fs = require("fs");
// //
// // const options = {
// //     cert: fs.readFileSync('./keys/d4bfdc557afb919a.crt'),
// //     ca:fs.readFileSync('./keys/gd_bundle-g2-g1.crt'),
// //     key: fs.readFileSync('./keys/asd.pem')
// // };
// //
// // const app = express();
// //
// // app.use((req, res) => {
// //     res.writeHead(200);
// //     res.end("hello world\n");
// // });
// //
// // https.createServer(options, app).listen(8080);
const userModel = require('./modules/userAccount').userAccountModel;

// let x = async () => {
//
//     let allusers = await userModel.find();
//     for (let one of allusers) {
//         if (one.wechatAccounts.length > 0) {
//             console.log(one.tel_number);
//
//             let newUrl = one.wechatAccounts[0].profileImgUrl.replace(`http`,`https`);
//             console.log(newUrl)
//
//             let x2 = await userModel.findOneAndUpdate({email_address: one.email_address},
//                 {$set: {"wechatAccounts.0.profileImgUrl": newUrl}},
//                 {new: true});
// console.log(x2.email_address)
//         }
//     }
//
// };
// x();