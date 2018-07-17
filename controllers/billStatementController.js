const billStatementModel = require('../modules/billStatement').billStatementModel;
//const userAccountModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logger');


exports.getBills = (req, res) => {

    billStatementModel.find({userTelNumber: req.user.tel_number}, (err, result) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: orderformController, function: updateOrderForm. ' + err);
                logger.error('Response code:406, message: Not Successed Saved');
                return res.status(406).send({success: false, message: 'Not Successed Saved'});
            } else {
                return res.status(200).send({error_code: 0, data: result});
            }
        }
    );
};


exports.addOrderForm = addOrderForm = (req, res) => {
    let billStatement = new billStatementModel();

    billStatement.typeState = req.body.typeState;
    billStatement.dealState = req.body.dealState;
    billStatement.sendPic = req.body.sendPic;
    billStatement.payFreight = req.body.payFreight;

    let randomNumber = (Math.random() * Date.now() * 10).toFixed(0);
    billStatement.orderID = 'DF' + randomNumber;

    billStatement.userTelNumber = req.user.tel_number;
    billStatement.orderAmount = req.body.orderAmount;
    billStatement.rate = req.body.rate;
    billStatement.NtdAmount = req.body.NtdAmount;
    billStatement.dealDate = req.body.dealDate;

    billStatement.save((err) => {
        if (err) {
            logger.info(req.body);
            logger.error('Error location : Class: billStatement, function: billStatement. ' + err);
            logger.error('Response code:503, message: Error Happened , please check input data');
            res.status(503).send({
                success: false,
                message: 'Error Happened , please check input data!'
            });
        } else {
            res.status(200).send({success: true, message: billStatement});
        }
    });

};