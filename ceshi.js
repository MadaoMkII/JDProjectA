const tool = require('./config/tools');
//
// console.log(tool.decrypt("632f0be607655a592bbb51483108b81d$e4288aaa6f5d95aeadd10f974ce97ddb$85c1db1f68fee7d69e9e2ed865c6d173cf6eef797195567355643e4183fbcad4"));
console.log(tool.encrypt(5500.58))
//console.log(Number("29.6")+0.4)
var str = "CHARAL10701000534821";
console.log(/^(CHAR)/.test(str));

// const dgBillModel = require('./modules/dgBill').dgBillModel;
//
//
// let x = async () => {
//
//     let orders = await dgBillModel.find({
//         "userInfo.email_address": "alan@fersonal.com",
//         "chargeInfo.chargeMethod": "Rcoin",
//         "typeState": 1,
//         "dealState": 1
//     });
//
//     let amount=0;
//     for (let one of orders) {
//
//         amount = amount+Number(one.RMBAmount)
//     }
//
// };
// console.log(new Date().getDate())
