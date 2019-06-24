const tool = require('./config/tools');
//
console.log(tool.decrypt("fcfab4c384030fcc9ad570701b2cce2c$30f23192de2ee042b593a7dd66ca31ab$84b24acced37f0e750b8196c219b93ff462183ce45ffcf24637093b5995dd32e"));
//console.log(tool.encrypt(5500.58))
//console.log(Number("29.6")+0.4)
var str = "CHARAL10701000534821";
console.log(/^(CHAR)/.test(str));

console.log(isNaN('asd'));
console.log(320+420+372+238+105);
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
