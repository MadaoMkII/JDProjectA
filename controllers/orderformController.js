const angentModel = require('../modules/agent').agentModel;
const orderModel = require('../modules/orderForm').orderFormModel;
const logger = require('../logging/logger');

//S1 接的广告
// Total S1+S2+S3 = 600
//
// receiveposition S1= total * 20%
//
//     Publish position s1, s2, s3
// agent 加入币种
// s1pub =(S1 :250) * 0.5
// s2pub =(S2 :200) * 0.5
// s3pub =(S3 :150) * 0.5
// S1 :250: currency

exports.getOrderform = (req, res) => {
    let option = req.params.option;
    let stationname;
    let command = {};

    switch (option) {

        case 'search':
            if (req.query._id) {
                if (req.user.role === 'Agent') {
                    return res.status(403).json({success: false, message: 'Insufficient privilege'});
                }
                command['_id'] = {$eq: req.query._id};
                break;
            }

            if (req.query['receiveSationName']) {
                if (req.user.role.toString() === 'Agent') {
                    stationname = req.user.stationname;
                } else {
                    if (!req.query['receiveSationName']) {
                        return res.status(406).json({success: false, message: 'receiveSationName can not be empty'});
                    }
                    stationname = req.query['receiveSationName'];
                }
                command['receivePosition.stationname'] = {$eq: stationname};
            }
            if (req.query['adStatus']) {
                if (!req.query['adStatus']) {
                    return res.status(406).json({success: false, message: 'adStatus can not be empty'});
                }
                let adStatusArray = req.query['adStatus'];
                command['adStatus'] = {$in: adStatusArray};
            }

            if (req.query['publishStationName']) {
                if (req.user.role === 'Agent') {
                    stationname = req.user.stationname;
                } else {
                    if (!req.query['publishStationName']) {
                        return res.status(406).json({success: false, message: 'publishStationName can not be empty'});
                    }
                    stationname = req.query['publishStationName'];
                }
                command['publishPositions.stationname'] = {$eq: stationname};
            }

            if (req.query['endBeforeDate'] && req.query['endAfterDate']) {
                command['adEndDate'] = {
                    $lt: new Date(req.query['endBeforeDate']),
                    $gt: new Date(req.query['endAfterDate'])
                };
            }
            if (req.query['beginBeforeDate'] && req.query['beginAfterDate']) {
                command['adBeginDate'] = {
                    $lt: new Date(req.query['beginBeforeDate']),
                    $gt: new Date(req.query['beginAfterDate'])
                };
            }

            if (Object.keys(req.query).length === 0) {
                return res.status(403).json({success: false, message: 'No search condition!'});
            }
            break;

        case 'all':
            if (req.user.role === 'Agent' && Object.keys(req.query).length === 0) {
                return res.status(403).json({success: false, message: 'Insufficient privilege'});
            } else {
                command = null;
            }
            break;
        default:
            return res.status(406).json({success: false, message: 'Need correct param send'});
    }

    let oprator = {};
    if (req.query['order'] && req.query['sortBy']) {
        oprator.sort = {};
        oprator.sort[req.query['sortBy']] = parseInt(req.query['order']);
    }

    if (req.query['page'] && req.query['unit']) {
        oprator.skip = req.query['page'] * req.query['unit'];
        oprator.limit = parseInt(req.query['unit']);
    }

    orderModel.find(command, {__v: 0}, oprator, (err, data) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: orderformController, function: getOrderForm. ' + err);
                logger.error('Response code:406, message: Not Successed Saved');
                return res.status(406).send({success: false, message: 'Not Successed Saved'});
            } else {
                return res.status(200).send({success: true, message: 'Successed Saved', orderform: data});
            }
        }
    );
}
;
exports.deleteOrderForm = (req, res) => {

    orderModel.remove({_id: req.query['_id']}, (err) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: orderformController, function: updateOrderForm. ' + err);
                logger.error('Response code:406, message: Not Successed Saved');
                return res.status(406).send({success: false, message: 'Not Successed Saved'});
            } else {
                return res.status(200).send({success: true, message: 'Successed Updated'});
            }
        }
    );
};


exports.updateOrderForm = (req, res) => {
    if (req.body['rebuilt']) {
        orderModel.remove({_id: req.body['_orderformid']}, (err) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: orderformController, function: updateOrderForm. ' + err);
                logger.error('Response code:406, message: Not Successed Saved');
                return res.status(406).send({success: false, message: 'Not Successed Saved'});
            } else {
                addOrderForm(req, res);
            }
        });
    } else {
        orderModel.update({_id: req.body['_orderformid']}, {
                $set: {
                    adStatus: req.body.adStatus,
                    adContinue : req.body.adContinue,
                    adType: req.body.adType,
                    adName: req.body.adName,
                    adBeginDate: new Date(req.body.adBeginDate),
                    adEndDate: new Date(req.body.adEndDate),
                    publishType: req.body.publishType,
                    customerName: req.body.customerName,
                    paymentMethod: req.body.paymentMethod,
                    customerWechat: req.body.customerWechat,
                    customerPhone: req.body.customerPhone,
                    orderTotalAmont: req.body.orderTotalAmont,
                    remark: req.body.remark
                }
            }, (err) => {
                if (err) {
                    logger.info(req.body);
                    logger.error('Error location : Class: orderformController, function: updateOrderForm. ' + err);
                    logger.error('Response code:406, message: Not Successed Saved');
                    return res.status(406).send({success: false, message: 'Not Successed Saved'});
                } else {

                    return res.status(200).send({success: true, message: 'Successed Updated'});
                }
            }
        );
    }
};

exports.addOrderForm = addOrderForm = (req, res) => {
    let orderInformation = req.body;
    let includeFlag = false;
    let publishPositions = orderInformation.publishPositions;
    let publishPositionsMap = new Map();
    let publishPositionsStringArray = [];
    orderInformation.publishPositions.forEach((position) => {
        publishPositionsMap.set(position.stationname, {amount: position.amount, currency: position.currency});
        publishPositionsStringArray.push(position.stationname);
    });
    let orderForm = new orderModel();
    if (publishPositionsStringArray.includes(orderInformation.receivePosition.stationname)) {
        includeFlag = true;
    } else {
        publishPositionsStringArray.push(orderInformation.receivePosition.stationname);
    }

    {
        if (!orderInformation.adStatus) {
        	orderForm.status = 'Pending';
        } else {
            orderForm.adStatus = orderInformation.adStatus;
        }

        orderForm._id = req.body['_orderformid'];
        orderForm.adName = orderInformation.adName;
        orderForm.adType = orderInformation.adType;
        orderForm.adBeginDate = orderInformation.adBeginDate;
        orderForm.adEndDate = orderInformation.adEndDate;
        orderForm.publishType = orderInformation.publishType;
        orderForm.orderTotalAmont = orderInformation.orderTotalAmont;
        orderForm.customerName = orderInformation.customerName;
        orderForm.paymentMethod = orderInformation.paymentMethod;
        orderForm.receivePosition = orderInformation.receivePosition;
        orderForm.publishPositions = orderInformation.publishPositions;
        orderForm.customerWechat = orderInformation.customerWechat;
        orderForm.customerPhone = orderInformation.customerPhone;
        orderForm.remark = orderInformation.remark;
        orderForm.adContinue = orderInformation.adContinue;
        orderForm.checkOrderRecords = [];
    }
    {
        if (!(null !== publishPositions && Array.isArray(publishPositions))) {
            return res.status(503).send({success: false, message: 'publishPositions has promblems'});
        } else {
            angentModel.findByPositionName(publishPositionsStringArray, (error, result) => {
                if (error) {
                    logger.info(req.body);
                    logger.error('Error location : Class: orderformController, function: addOrderForm. ' + error);
                    logger.error('Response code:503, message: Error happen when adding to DB');
                    return res.status(503).send({success: false, message: 'Error happen when adding to DB'});
                }
                result.forEach((element) => {
                    let shouldPay, checkOrder;
                    if (includeFlag || element.stationname !== orderInformation.receivePosition.stationname) {
                        let everyPublishStation = publishPositionsMap.get(element.stationname);

                        shouldPay = Math.round(everyPublishStation.amount * element.publishrate * 100) / 100;
                        checkOrder = {
                            job: 'publish',
                            adName: orderInformation.adName,
                            adBeginDate: orderInformation.adBeginDate,
                            adEndDate: orderInformation.adEndDate,
                            receiveStation: orderInformation.receivePosition.stationname,
                            shouldPayStation: element.stationname,
                            customerWechat: orderInformation.customerWechat,
                            orderAmont: shouldPay,
                            currency: everyPublishStation.currency,
                            remark: orderInformation.remark
                        };

                        orderForm.checkOrderRecords.push(checkOrder);
                    }
                    if (element.stationname === orderInformation.receivePosition.stationname) {
                        let shouldPay = Math.round(orderInformation.orderTotalAmont//comes from user input
                            * element.receiverate * 100) / 100;

                        let checkOrder = {
                            job: 'receive',
                            adName: orderInformation.adName,
                            adBeginDate: orderInformation.adBeginDate,
                            adEndDate: orderInformation.adEndDate,
                            currency: orderInformation.receivePosition.currency,
                            receiveStation: element.stationname,
                            shouldPayStation: element.stationname,
                            customerWechat: orderInformation.customerWechat,
                            orderAmont: shouldPay,
                            remark: orderInformation.remark
                        };
                        orderForm.checkOrderRecords.push(checkOrder);
                    }
                });

                orderForm.save((err) => {
                    if (err) {
                        logger.info(req.body);
                        logger.error('Error location : Class: orderformController, function: addOrderForm. ' + err);
                        logger.error('Response code:503, message: Error Happened , please check input data');
                        res.status(503).send({
                            success: false,
                            message: 'Error Happened , please check input data!'
                        });
                    } else {
                        res.status(200).send({success: true, message: orderForm._id});
                    }
                });
            });
        }
    }
};

exports.payAmount = (req, res) => {
    let paymentElement = {};
    paymentElement._id = req.body['checkOrderId'];
    paymentElement.paymentDate = req.body['payDay'];
    paymentElement.paymentAmount = req.body['paymentAmount'];
    orderModel.update({'checkOrderRecords._id': paymentElement._id}, {
            $push: {
                'checkOrderRecords.$.paymentHistories': {
                    paymentDate: paymentElement.paymentDate,
                    paymentAmount: paymentElement.paymentAmount
                }
            }
        }, (err) => {
            if (err) {
                logger.debug(req.body);
                logger.error('Error location : Class: orderformController, function: payAmount. ' + err);
                logger.error('Response code:503, message: Error Happened , please check input data');
                res.status(503).send({
                    success: false,
                    message: 'Error Happened , please check input data!'
                });
            } else {
                res.status(200).send({success: true, message: 'Successed Saved'});
            }
        }
    );
};
exports.updatePayment = (req, res) => {

    let paymentElement = {};
    paymentElement.checkOrderId = req.body['checkOrderId'];
    paymentElement.paymentId = req.body['paymentId'];
    paymentElement.paymentDate = req.body['payDay'];
    paymentElement.paymentAmount = req.body['paymentAmount'];

    orderModel.update({
            'checkOrderRecords._id': paymentElement.checkOrderId
        }, {
            $pull: {
                'checkOrderRecords.$.paymentHistories': {'_id': {$eq: paymentElement.paymentId}}
            }
        }, (err) => {
            if (err) {
                logger.info(req.body);
                logger.error('Error location : Class: orderformController, function: updatePayment. ' + err);
                logger.error('Response code:503, message: Error Happened , please check input data');
                return res.status(503).send({
                    success: false,
                    message: 'Error Happened , please check input data!'
                });
            } else {
                orderModel.update({
                    'checkOrderRecords._id': paymentElement.checkOrderId
                }, {
                    $push: {
                        'checkOrderRecords.$.paymentHistories': {
                            _id: paymentElement.paymentId,
                            paymentDate: paymentElement.paymentDate,
                            paymentAmount: paymentElement.paymentAmount
                        }
                    }
                }, (err) => {
                    if (err) {
                        logger.info(req.body);
                        logger.error('Error location : Class: orderformController, function: updatePayment. ' + err);
                        logger.error('Response code:503, message: Error Happened , please check input data');
                        return res.status(503).send({
                            success: false,
                            message: 'Error Happened , please check input data!'
                        });
                    } else {
                        return res.status(200).send({success: true, message: 'Successed Saved'});
                    }
                });
            }
        }
    );
};

exports.deletePayment = (req, res) => {
	console.log("DELETE");
    let paymentElement = {};
    paymentElement.paymentId = req.query['paymentId'];
    paymentElement.checkOrderId = req.query['checkOrderId'];
    orderModel.update({
        'checkOrderRecords._id': paymentElement.checkOrderId
    }, {
        $pull: {
            'checkOrderRecords.$.paymentHistories': {'_id': {$eq: paymentElement.paymentId}}
        }
    }, (err) => {
        if (err) {
            logger.info(req.body);
            logger.error('Error location : Class: orderformController, function: deletePayment. ' + err);
            logger.error('Response code:503, message: Error Happened , please check input data!');
            return res.status(503).send({
                success: false,
                message: 'Error Happened , please check input data!'
            });
        } else {
            return res.status(200).send({success: true, message: 'Successed Deleted'});
        }
    });
};
