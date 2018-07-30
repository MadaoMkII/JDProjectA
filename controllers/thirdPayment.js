const payingBillModel = require('../modules/payingBill').payingBillModel;
const logger = require('../logging/logger');
const url = require('url');
const mongoose = require('../db/db').mongoose
const userModel = require('../modules/userAccount').userAccountModel;
const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;


exports.addTBDFBill = async (req, res) => {


    // let TBstuffUrl = url.parse(req.body.TBLink, true);
    //
    // if (TBstuffUrl.hostname !== 'item.taobao.com' || !isNaN(TBstuffUrl.id)) {
    //
    //     return res.status(503).send({error_code: 503, error_msg: 'Error'});
    // }
    // let stuffId = TBstuffUrl.query.id;

    try {

        let userInfo = await userModel.findOne({tel_number: req.user.tel_number});
        //      throw new Error("Something went wrong...");
        let settings = await managerConfigsModel.findOne().sort('-created_at');
        let billObject = new payingBillModel();

        billObject.typeStr = `淘宝代付`;
        billObject.billID = 'TBDF' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.userID = userInfo._id;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30));
        billObject.RMBAmount = req.body.RMBAmount;
        billObject.NtdAmount = settings.rate * req.body.RMBAmount;

        billObject.fee = billObject.RMBAmount * 0.2;
        billObject.rate = settings.rate;
        billObject.comment = req.body.comment;
        billObject.paymentMethod = req.body.paymentMethod;
        billObject.TBStuffInfo.friendAccount = req.body.friendAccount;
        //如果不存在
        billObject.TBStuffInfo.stuffName = req.body.stuffName;
        billObject.TBStuffInfo.staffUrl = req.body.staffUrl;

        //await billObject.save();

        return res.status(200).send({error_code: 513, error_msg: billObject});
    } catch (e) {
        return res.status(200).send({error_code: 513, error_msg: e});
    }
};


exports.addCZBill = async (req, res) => {

    try {
        let settings, personalInfo;
        settings = await managerConfigsModel.findOne().sort('-created_at');
        personalInfo = await userModel.findOne({tel_number: req.user.tel_number});

        let billObject = new payingBillModel();

        billObject.typeStr = 'CZ';
        billObject.billID = 'CZ' + (Math.random() * Date.now() * 10).toFixed(0);
        billObject.userID = personalInfo._id;

        billObject.RMBAmount = req.body.RMBAmount;
        if (billObject.RMBAmount < 5) {
            return res.status(404).send({error_code: 513, error_msg: '钱太少'});
        }
        billObject.NtdAmount = req.body.RMBAmount * settings.rate;
        billObject.fee = 0;
        billObject.comment = req.body.comment;
        billObject.paymentMethod = req.body.paymentMethod;
        billObject.dealDate = new Date((new Date().getTime() + 1000 * 60 * 30));
        billObject.CZPayment.DCAccountType = req.body.CZAccountType;
        billObject.CZPayment.CZAccount = req.body.CZAccount;
        //billObject.DCPayment.payFromAccount = '未指定';

        await billObject.save();

        console.log(billObject)

        return res.status(200).send({error_code: 200, error_msg: billObject});
    } catch (error) {
        console.log(error)
        return res.status(404).send({error_code: 514, error_msg: error});
    } finally {
        console.log(122423432)

    }
};
exports.addPayBills = (req, res) => {


    let billObject = new payingBillModel();

    billObject.billType = req.body.billType;
    billObject.billId = 'DF' + (Math.random() * Date.now() * 10).toFixed(0);
    billObject.RMBAmount = req.body.RMBAmount;
    // if (req.body.needToPayNTDAmount !== billObject.RMBAmount * billObject.rate) {
    //     return error();
    // }
    billObject.needToPayNTDAmount = req.body.needToPayNTDAmount;
    billObject.paymentMethod = req.body.paymentMethod;
    billObject.payFromAccount = req.body.payFromAccount;
    billObject.payToAccount = req.body.payToAccount;
    billObject.comment = req.body.comment;
    console.info(billObject);
    billObject.save((err) => {

            if (err) {
                console.log(err)
                logger.info(req.body);
                logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
                logger.error('Response code:406, message: Not Succeeded Saved');
                return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
            } else {
                return res.status(200).send({error_code: 0, error_msg: 'OK'});
            }
        }
    );
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