const tool = require('./config/tools');

const chargeBillModel = require('./modules/chargeBill').chargeBillModel;
const dataAnalystModel = require('./modules/dataAnalyst').dataAnalystModel;

let addAll = async () => {


    let res = await dataAnalystModel.find({'dateClock' : {

            $gt: new Date("2019-03-04")
        }});


    console.log(res)
};
addAll();