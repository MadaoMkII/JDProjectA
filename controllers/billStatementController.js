const billStatementModel = require('../modules/billStatement').billStatementModel;
//const userAccountModel = require('../modules/userAccount').userAccountModel;
const logger = require('../logging/logger');


exports.getBills = (req, res) => {

    billStatementModel.find({userTelNumber: req.user.tel_number}, {
            __v: 0,
            billStatementId: 0,
            _id: 0
        }, {}, (err, result) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: billStatementModel, function: updateOrderForm. ' + err);
                logger.error('Response code:406, message: Not Succeeded Saved');
                return res.status(406).send({error_code: 0, error_msg: 'Not Succeeded Saved'});
            } else {
                return res.status(200).send({error_code: 0, data: result});
            }
        }
    );
};


exports.addBillStatement = (req, res) => {
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
            logger.error('Response code:406, message: Error Happened , please check input data');

            res.status(503).send({error_msg: `${err.message}`, error_code: "406"});
        } else {
            res.status(200).send({error_msg: `OK`, error_code: "0"});
        }
    });

};