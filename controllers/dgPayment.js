const dgBillModel = require('../modules/dgBill').dgBillModel;
const logger = require('../logging/logger');
const userModel = require('../modules/userAccount').userAccountModel;
const manageSettingController = require('../controllers/manageSettingController');
const tool = require('../config/tools');


exports.addDGBill = async (req, res) => {

    try {
        let uproce = tool.encrypt(`` + 1000);

       let user= await userModel.findOneAndUpdate({uuid: req.user.uuid}, {$set: {Rcoins: uproce}}, {new: true});

        console.log(user.Rcoins)
        if (req.user.Rcoins < req.body.itemInfo.itemPrice) {
            return res.status(200).send({error_code: 513, error_msg: '要不起'});
        }
        const managerConfig = await manageSettingController.findCurrentSetting();
        let billObject = new dgBillModel();
        billObject.typeStr = '淘宝代付';
        billObject.billID = 'DG' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.RMBAmount = req.body.RMBAmount;
        //billObject.userUUid = req.user.uuid;
        billObject.expireDate = new Date((new Date().getTime() + 1000 * 60 * 30)).getTime();
        billObject.comment = req.body.comment;
        billObject.paymentInfo = {};
        billObject.paymentInfo.paymentMethod = 'Rcoin';
        billObject.itemInfo = {};
        billObject.itemInfo.itemName = req.body.itemInfo.itemName;
        billObject.itemInfo.itemLink = req.body.itemInfo.itemLink;
        billObject.itemInfo.itemPrice = req.body.itemInfo.itemPrice;

        billObject.fee = managerConfig.feeRate * req.body.RMBAmount;
        //await billObject.save();

        return res.status(200).send({error_code: 0, error_msg: "OK", data: billObject});
    }
    catch (e) {
        console.log(e)
        return res.status(513).send({error_code: 513, error_msg: e});
    }
};

//
// exports.addCZBill = async (req, res) => {
//
//     try {
//         let settings, personalInfo;
//         settings = await managerConfigsModel.findOne().sort('-created_at');
//         personalInfo = await userModel.findOne({tel_number: req.user.tel_number});
//
//         let billObject = new payingBillModel();
//
//         billObject.typeStr = 'CZ';
//         billObject.billID = 'CZ' + (Math.random() * Date.now() * 10).toFixed(0);
//         billObject.userID = personalInfo._id;
//
//         billObject.RMBAmount = req.body.RMBAmount;
//         if (billObject.RMBAmount < 5) {
//             return res.status(404).send({error_code: 513, error_msg: '钱太少'});
//         }
//
//         billObject.NtdAmount = req.body.RMBAmount * settings.rate;
//         billObject.fee = 0;
//         billObject.comment = req.body.comment;
//         billObject.paymentMethod = req.body.paymentMethod;
//         billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30));
//         billObject.CZPayment.DCAccountType = req.body.CZAccountType;
//         billObject.CZPayment.CZAccount = req.body.CZAccount;
//         //billObject.DCPayment.payFromAccount = '未指定';
//
//         await billObject.save();
//
//         console.log(billObject)
//
//         return res.status(200).send({error_code: 200, error_msg: billObject});
//     } catch (error) {
//         console.log(error)
//         return res.status(404).send({error_code: 514, error_msg: error});
//     } finally {
//         console.log(122423432)
//
//     }
// };
// exports.addPayBills = (req, res) => {
//
//
//     let billObject = new payingBillModel();
//
//     billObject.billType = req.body.billType;
//     billObject.billId = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
//     billObject.RMBAmount = req.body.RMBAmount;
//     // if (req.body.needToPayNTDAmount !== billObject.RMBAmount * billObject.rate) {
//     //     return error();
//     // }
//     billObject.needToPayNTDAmount = req.body.needToPayNTDAmount;
//     billObject.paymentMethod = req.body.paymentMethod;
//     billObject.payFromAccount = req.body.payFromAccount;
//     billObject.payToAccount = req.body.payToAccount;
//     billObject.comment = req.body.comment;
//     console.info(billObject);
//     billObject.save((err) => {
//
//             if (err) {
//                 console.log(err)
//                 logger.info(req.body);
//                 logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
//                 logger.error('Response code:406, message: Not Succeeded Saved');
//                 return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
//             } else {
//                 return res.status(200).send({error_code: 0, error_msg: 'OK'});
//             }
//         }
//     );
// };

exports.getBills = async (req, res) => {
    try {
        let command = {};


        if (req.body.dealState) {
            command['dealState'] = {$eq: req.body.dealState};
        }

        let operator = {};
        if (req.body['order'] && req.body['sortBy']) {
            operator.sort = {};
            operator.sort[req.body['sortBy']] = parseInt(req.body['order']);
        }

        if (req.body['page'] !== null && req.body['unit'] !== null) {
            operator.skip = req.body['page'] * req.body['unit'];
            operator.limit = parseInt(req.body['unit']);
        }

        let personalInfo = await userModel.findOne({tel_number: req.user.tel_number});
        command['userID'] = {$eq: personalInfo._id};
        let billResult = await payingBillModel.find(command, {
            __v: 0,
            billStatementId: 0,
            _id: 0
        }, operator);
        let billCount = await payingBillModel.count({userID: personalInfo._id});

        return res.status(200).send({error_code: 503, error_msg: billResult, nofdata: billCount});

    } catch (err) {
        return res.status(503).send({error_code: 503, error_msg: err});
    }

};

// let searchPayBills = async (query) => {
//
//     try {
//         let accounts = await payingBillModel.findOne({comment:'你大爷'},{'_id':0,updated_at:0});
//
//         console.log(accounts) ;
//
//         mongoose.disconnect();
//     } catch (error) {
//
//         return {error}
//
//     }
//
//
// };
// searchPayBills(null).then();