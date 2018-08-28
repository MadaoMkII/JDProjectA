const appealFormModel = require('../modules/appealForm').appealFormModel;
const picController = require('../controllers/picController');
//const logger = require('../logging/logger');

exports.addAppealForm = (req, res) => {

    picController.uploadImgArray(req, res, () => {

            if (typeof (req.files) === 'undefined') {
                return res.json({error_msg: `403`, error_code: "失败！"});
            }

            let appealFormObject = new appealFormModel();
            appealFormObject.appealFormID = 'AP' + (Math.random() * Date.now() * 10).toFixed(0);
            appealFormObject.L1_Issue = req.body.L1_Issue;
            appealFormObject.L2_Issue = req.body.L2_Issue;
            appealFormObject.L3_Issue = req.body.L3_Issue;
            appealFormObject.description = req.body.description;
            //appealFormObject.userUUID = req.user.uuid;
            for (let img of req.files) {
                appealFormObject.imagesFilename.push(img.filename);
            }
            if (!appealFormObject.appealFormID || !appealFormObject.L1_Issue ||
                !appealFormObject.L2_Issue || !appealFormObject.L3_Issue || !appealFormObject.description) {
                return res.status(203).json({
                    error_code: `203`,
                    filenames: appealFormObject.imagesFilename,
                    error_msg: "接口直接调用，无其它信息属性值输入"
                });
            }

            appealFormObject.save((err) => {
                if (err) {
                    return res.status(503).json({error_msg: `503`, error_code: "Error input"});
                }
                return res.status(200).json({error_msg: `200`, error_code: "OK！", data: appealFormObject});
            });
        }
    )
};

exports.getAppealForm = (req, res) => {


    let command = {};

    if (req.body.isSolved) {
        command['isSolved'] = {$eq: req.body.isSolved};
    }
    if (req.body.L1_Issue) {
        command['L1_Issue'] = {$eq: req.body.L1_Issue};
    }
    if (req.body.L2_Issue) {
        command['L2_Issue'] = {$eq: req.body.L2_Issue};
    }
    if (req.body.L3_Issue) {
        command['L3_Issue'] = {$eq: req.body.L3_Issue};
    }

    if (req.body.appealFormID) {
        command['appealFormID'] = {$eq: req.body.appealFormID};
    }
    if (req.body.userUUID) {
        command['userUUID'] = {$eq: req.body.userUUID};
    }


    if (req.body['createdAt']) {
        command['created_at'] = {};
        if (req.body[`createdAt`]['beforeDate']) {
            command['created_at'].$lte = new Date(req.body[`createdAt`]['beforeDate']);
        }
        if (req.body[`createdAt`]['afterDate']) {
            command['created_at'].$gte = new Date(req.body[`createdAt`]['afterDate']);
        }

    }
    if (req.body['updatedAt']) {
        command['updated_at'] = {};
        if (req.body[`updatedAt`]['beforeDate']) {
            command['updated_at'].$lte = new Date(req.body[`updatedAt`]['beforeDate']);
        }
        if (req.body[`updatedAt`]['afterDate']) {
            command['updated_at'].$gte = new Date(req.body[`updatedAt`]['afterDate']);
        }

    }

    let operator = {};
    if (req.body['order'] && req.body['sortBy']) {
        operator.sort = {};
        operator.sort[req.body['sortBy']] = parseInt(req.body['order']);
    }


    console.log(command)
    appealFormModel.find(command, {
        __v: 0,
        _id: 0
    }, operator).exec((err, results) => {
            let countNumber = results.length;
            let afterRes = results;

            if (err) {
                return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
            }
            if (req.body['page'] !== undefined && req.body['unit'] !== undefined) {
                let begin = req.body['page'] * req.body['unit'],
                    end = (req.body['page'] + 1) * req.body['unit'] >= results.length ?
                        results.length : (req.body['page'] + 1) * req.body['unit'];
                afterRes = results.slice(begin, end);

            }

            return res.status(200).send({error_code: 0, data: afterRes, nofdata: countNumber});

        }
    );
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

exports.delAppealForm = (req, res) => {
    // if (!req.body.link) {
    //     return res.json({error_msg: `403`, error_code: "LINK 为空失败！"});
    // }

    picController.deleteImgs(req, res, () => {

            let appealFormID = req.body.appealFormID;
            appealFormModel.remove({appealFormID: appealFormID}, (err) => {
                if (err) {
                    return res.json({error_msg: `400`, error_code: "advertising Error"});
                } else {
                    return res.json({error_msg: `OK`, error_code: "0"});
                }


            })
        }
    )
};
