const appealFormModel = require('../modules/appealForm').appealFormModel;
//const picController = require('../controllers/picController');
//const isEmpty = require('../config/tools').isEmpty;
const logger = require('../logging/logging').logger;
const searchModel = require('../controllers/searchModel');

exports.addAppealForm = (req, res) => {

    let appealFormObject = new appealFormModel();
    appealFormObject.appealFormID = 'AP' + (Math.random() * Date.now() * 10).toFixed(0);
    appealFormObject.L1_Issue = req.body.L1_Issue;
    appealFormObject.L2_Issue = req.body.L2_Issue;
    appealFormObject.L3_Issue = req.body.L3_Issue;
    appealFormObject.imagesFileArray = req.body.imagesFileArray;
    appealFormObject.description = req.body.description;
    appealFormObject.userUUID = req.user.uuid;
    appealFormObject.tel_number = req.user.tel_number;
    appealFormObject.save((err) => {
        if (err) {
            let errorResult = '';
            for (let errorField in err.errors) {
                if (err.errors[errorField].hasOwnProperty('message')) {
                    errorResult = err.errors[errorField].message;
                }
            }
            logger.error(`addAppealForm`, {req: req, error: err.message});
            return res.status(503).json({
                error_msg: `503`,
                error_code: errorResult === '' ? 'error happen' : errorResult
            });
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
                logger.error(`setResponseAppealForm`, {req: req, error: err.message});
                return res.status(503).json({error_msg: `503`, error_code: "Error input"});
            }
            if (!data) {
                return res.status(404).json({error_msg: `404`, error_code: "Can not find this appeal！"})
            }

            logger.warn(`setResponseAppealForm`, {req: req});
            return res.status(200).json({error_msg: `200`, error_code: "OK！", data: data});

        }
    )
};
let findAppealFormDAO = async (req, res, searchArgs, operator) => {


    return new Promise(async (resolve, reject) => {
        try {
            let result = await appealFormModel.find(
                searchArgs.searchCondition,
                searchArgs.showCondition,
                operator);


            let count = await appealFormModel.countDocuments(searchArgs.searchCondition);

            resolve([result, count]);
        } catch (err) {
            logger.error(`findAppealFormDAO`, {req: req, error: err.message});
            reject(err);
        }

    });


};
exports.getMyAppealForm = async (req, res) => {
    try {

        let command = {};
        command.showCondition = {
            __v: 0,
            _id: 0,
            userUUID: 0
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `userUUID`, "require": false, custom: false}
        );
        let operator = searchModel.pageModel(req, res);
        command.searchCondition = Object.assign(command.searchCondition, searchModel.createAndUpdateTimeSearchModel(req));

        let [result, count] = await findAppealFormDAO(req, res, command, operator);
        return res.status(200).send({error_code: 0, data: result, nofdata: count});
    } catch (err) {
        logger.error(`getMyAppealForm`, {req: req, error: err.message});
        return res.status(500).send({error_code: 500, error_msg: "Error happen"});
    }


};


exports.getAppealFormById = async (req, res) => {
    try {

        let command = {};
        command.showCondition = {
            __v: 0,
            _id: 0
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `appealFormID`, "require": false}
        );
        if (req.user.role === `User`) {
            Object.assign(command.searchCondition, {userUUID: req.user.uuid})
        }

        let [result, count] = await findAppealFormDAO(req, res, command);
        return res.status(200).send({error_code: 0, data: result, nofdata: count});

    } catch (err) {
        logger.error(`getAppealFormById`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    }

};

exports.findAppealForm = async (req, res) => {
    try {

        let command = {};
        command.showCondition = {
            __v: 0,
            _id: 0,
            response: 0,
            imagesFileArray: 0
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `userUUID`, "require": false, custom: true},//custom 表明值来自前端 ，false表明来自登录用户
            {"filedName": `isSolved`, "require": false},
            {"filedName": `L1_Issue`, "require": false},
            {"filedName": `L2_Issue`, "require": false},
            {"filedName": `L3_Issue`, "require": false},
            {"filedName": `appealFormID`, "require": false},
            {"filedName": `tel_number`, "require": false}
        );
        let operator = searchModel.pageModel(req, res);
        command.searchCondition = Object.assign(command.searchCondition,
            searchModel.createAndUpdateTimeSearchModel(req, res));

        let [result, count] = await findAppealFormDAO(req, res, command, operator);
        return res.status(200).send({error_code: 0, data: result, nofdata: count});

    } catch (err) {
        logger.error(`findAppealForm`, {req: req, error: err.message});
        return res.status(503).send({error_code: 503, error_msg: 'Error when attaching data'});
    }

};

exports.getThisUserAllAppealForm = (req, res) => {

    appealFormModel.find({userUUID: req.user.uuid}, (err, data) => {
            if (err) {
                logger.error(`获取用户一个申诉`, {req: req, error: err.message});
                return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
            } else {

                return res.status(200).json({error_msg: `OK`, error_code: "0", data: data});
            }
        }
    )
};

exports.delAppealForm = async (req, res) => {

    try {
        let appealFormID = req.body.appealFormID;
        //let picResult = await appealFormModel.findOne({appealFormID: appealFormID});
        await appealFormModel.deleteOne({appealFormID: appealFormID});
        // for (let entity of picResult.imagesFileArray) {
        //     let fileName = entity.replace(`http://www.yubaopay.com.tw/image/`, ``);
        //     fileName = fileName.replace(`http://localhost:3000/image/`, ``);
        //     req.body.filename = fileName;
        //     await picController.deleteImgs(req, res, () => {
        //     });
        // }
        logger.warn(`delAppealForm`, {req: req});
        return res.status(200).json({error_msg: `OK`, error_code: "0"});
    } catch (err) {
        logger.error(`删除申诉`, {req: req, error: err.message});
        return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
    }
};
