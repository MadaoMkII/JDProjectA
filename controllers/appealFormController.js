const appealFormModel = require('../modules/appealForm').appealFormModel;
const picController = require('../controllers/picController');
const isEmpty = require('../config/tools').isEmpty;
//const logger = require('../logging/logger');

exports.addAppealForm = (req, res) => {

    let appealFormObject = new appealFormModel();
    appealFormObject.appealFormID = 'AP' + (Math.random() * Date.now() * 10).toFixed(0);
    appealFormObject.L1_Issue = req.body.L1_Issue;
    appealFormObject.L2_Issue = req.body.L2_Issue;
    appealFormObject.L3_Issue = req.body.L3_Issue;
    appealFormObject.imagesFileArray = req.body.imagesFileArray;
    appealFormObject.description = req.body.description;
    appealFormObject.userUUID = req.user.uuid;

    appealFormObject.save((err) => {
        if (err) {
            return res.status(503).json({error_msg: `503`, error_code: "Error input"});
        }
        return res.status(200).json({error_msg: `200`, error_code: "OK！", data: appealFormObject});
    })

};

exports.setResponseAppealForm = (req, res) => {


    let issue_response = req.body.response;
    appealFormModel.findOneAndUpdate({appealFormID: req.body.appealFormID}, {
            $set: {
                response: issue_response,
                isSolved: true
            }
        }, {new: true}, (err, data) => {
            if (err) {
                return res.status(503).json({error_msg: `503`, error_code: "Error input"});
            }
            if (!data) {
                return res.status(404).json({error_msg: `404`, error_code: "Can not find this appeal！"})
            }
            return res.status(200).json({error_msg: `200`, error_code: "OK！", data: data});

        }
    )
};

exports.getMyAppealForm = async (req, res) => {
    try {
        let result = await appealFormModel.find({userUUID: req.user.uuid}, {
            __v: 0,
            _id: 0
        });
        return res.status(200).send({error_code: 0, data: result, nofdata: result.length});
    } catch (e) {
        return res.status(500).send({error_code: 500, error_msg: "Error happen"});
    }


};
exports.findAppealForm = async (req, res) => {
    try {
        let command = {};

        if (!isEmpty(req.body.isSolved)) {
            command['isSolved'] = {$eq: req.body.isSolved};
        }
        if (!isEmpty(req.body.L1_Issue)) {
            command['L1_Issue'] = {$eq: req.body.L1_Issue};
        }
        if (!isEmpty(req.body.L2_Issue)) {
            command['L2_Issue'] = {$eq: req.body.L2_Issue};
        }
        if (!isEmpty(req.body.L3_Issue)) {
            command['L3_Issue'] = req.body.L3_Issue;
        }

        if (!isEmpty(req.body.appealFormID)) {
            command['appealFormID'] = req.body.appealFormID;
        }
        if (!isEmpty(req.body.userUUID)) {
            command['userUUID'] = req.body.userUUID;
        }

        if (!isEmpty(req.body['createdAt'])) {
            command['created_at'] = {};
            if (req.body[`createdAt`]['beforeDate'] < req.body[`createdAt`]['afterDate']) {
                return res.status(400).send({error_code: 400, error_msg: 'beforeDate can not less than afterDate'});
            }
            if (!isEmpty(req.body[`createdAt`]['beforeDate'])) {
                command['created_at'].$lte = new Date(req.body[`createdAt`]['beforeDate']);
            }
            if (!isEmpty(req.body[`createdAt`]['afterDate'])) {
                command['created_at'].$gte = new Date(req.body[`createdAt`]['afterDate']);
            }

        }
        if (!isEmpty(req.body['updatedAt'])) {
            command['updated_at'] = {};
            if (req.body[`updatedAt`]['beforeDate'] < req.body[`updatedAt`]['afterDate']) {
                return res.status(400).send({error_code: 400, error_msg: 'beforeDate can not less than afterDate'});
            }
            if (!isEmpty(req.body[`updatedAt`]['beforeDate'])) {
                command['updated_at'].$lte = new Date(req.body[`updatedAt`]['beforeDate']);
            }
            if (!isEmpty(req.body[`updatedAt`]['afterDate'])) {
                command['updated_at'].$gte = new Date(req.body[`updatedAt`]['afterDate']);
            }
        }

        let operator = {};

        if (!isEmpty(req.body['page']) && !isEmpty(req.body['unit'])) {
            operator.skip = (parseInt(req.body['page']) - 1) * parseInt(req.body['unit']);
            operator.limit = parseInt(req.body['unit']);
        }
        if ((!isEmpty(req.body['order']) && (!isEmpty(req.body['sortBy'])))) {
            operator.sort = {};
            operator.sort[req.body['sortBy']] = parseInt(req.body['order']);
        }

        let result = await appealFormModel.find(command, {
            __v: 0,
            _id: 0
        }, operator);
        let count = await appealFormModel.count(command);

        return res.status(200).send({error_code: 0, data: result, nofdata: count});
    } catch (e) {
        return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    }

};

exports.getThisUserAllAppealForm = (req, res) => {

    appealFormModel.find({userUUID: req.user.uuid}, (err, data) => {
            if (err) {
                return res.json({error_msg: `400`, error_code: "advertising Error"});
            } else {
                return res.json({error_msg: `OK`, error_code: "0", data: data});
            }
        }
    )
};

exports.delAppealForm = async (req, res) => {

    try {
        let appealFormID = req.body.appealFormID;
        let picResult = await appealFormModel.findOne({appealFormID: appealFormID});
        appealFormModel.remove({appealFormID: appealFormID});
        for (let entity of picResult.imagesFileArray) {
            let fileName = entity.replace(`http://www.yubaopay.com.tw/image/`, ``);
            fileName = fileName.replace(`http://localhost:3000/image/`, ``);
            req.body.filename = fileName;
            await picController.deleteImgs(req, res, () => {
            });
        }

        return res.json({error_msg: `OK`, error_code: "0"});
    } catch (e) {
        return res.json({error_msg: `400`, error_code: "advertising Error"});
    }
};
