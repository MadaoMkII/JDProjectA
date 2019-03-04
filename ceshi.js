const tool = require('./config/tools');

const chargeBillModel = require('./modules/chargeBill').chargeBillModel;


let addAll = async () => {


    let res = await chargeBillModel.find({processOrder: {$exists: true}, typeStr: "微信錢包儲值"});
let y =0;
    for (let x of res) {

            y+=x.NtdAmount;
    }

    console.log(y)
};
addAll();