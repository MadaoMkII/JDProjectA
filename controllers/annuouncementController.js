const announcementModel = require('../modules/announcement').announcementModel;
const anModel = require('../modules/announcement').announceModel;
const uuidv1 = require('uuid/v1');
const isEmpty = require('../config/tools').isEmpty;
const searchModel = require('../controllers/searchModel');
const logger = require('../logging/logging').logger;
exports.findAnnouncement = async (req, res) => {

    try {
        let searchCommand = {};
        if (!isEmpty(req.body.location)) {
            searchCommand.location = req.body.location;
        }
        if (!isEmpty(req.body.announcementID)) {
            searchCommand.announcementID = req.body.announcementID;
        }
        if (!isEmpty(req.body.announcementLink)) {
            searchCommand.announcementLink = req.body.announcementLink;
        }
        if (!isEmpty(req.body.announcementTopic)) {

            searchCommand.announcementTopic = req.body.announcementTopic;
        }
        let operator = searchModel.pageModel(req, res);

        let result = await announcementModel.find(searchCommand, {
            __v: 0,
            _id: 0
        }, operator).populate(`model`);
        let billCount = await announcementModel.countDocuments(searchCommand);
        return res.json({error_msg: `OK`, error_code: "0", data: result, nofdata: billCount});

    } catch (err) {
        logger.error(`搜索公告`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
    }


};
exports.updateHelpCenterAnnouncement = async (req, res) => {

    try {
        let searchCommand = {};
        if (!isEmpty(req.body.model_name)) {
            let anResult = await anModel.findOne({name: req.body.model_name});
            if (isEmpty(anResult)) {
                return res.status(406).json({error_msg: `406`, error_code: "model_name is empty"});
            } else {
                searchCommand.model = anResult._id;
            }
        }
        if (!isEmpty(req.body.content)) {
            searchCommand.content = req.body.content;
        }
        if (!isEmpty(req.body.announcementLink)) {
            searchCommand.announcementLink = req.body.announcementLink.trim();
        }
        if (!isEmpty(req.body.announcementTopic)) {
            searchCommand.announcementTopic = req.body.announcementTopic;
        }
        if (isEmpty(req.body.announcementID)) {
            return res.status(406).json({error_msg: `406`, error_code: "announcementID can not be empty"});
        }

        let returnResult = await announcementModel.findOneAndUpdate({announcementID: req.body.announcementID}, {
            $set: searchCommand
        }, {new: true}).populate(`model`);

        if (isEmpty(returnResult)) {
            return res.status(200).json({error_msg: `can not find announcement`, error_code: "404"});
        }
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: returnResult});
    } catch (err) {
        logger.error(`更新帮助中心公告`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "announcement Error"});
    }

};
exports.updateAnnouncement = async (req, res) => {

    try {
        let searchCommand = {};

        if (!isEmpty(req.body.location)) {
            searchCommand.location = req.body.location;
        }

        if (!isEmpty(req.body.content)) {
            searchCommand.content = req.body.content;
        }
        if (!isEmpty(req.body.announcementLink)) {
            searchCommand.announcementLink = req.body.announcementLink.trim();
        }
        if (!isEmpty(req.body.announcementTopic)) {
            searchCommand.announcementTopic = req.body.announcementTopic;
        }
        if (isEmpty(req.body.announcementID)) {
            return res.status(406).json({error_msg: `406`, error_code: "announcementID can not be empty"});
        }

        let returnResult = await announcementModel.findOneAndUpdate({announcementID: req.body.announcementID}, {
            $set: searchCommand
        }, {new: true});

        return res.json({error_msg: `OK`, error_code: "0", data: returnResult});
    } catch (err) {
        logger.error(`更新帮助公告`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "announcement Error"});
    }

};
exports.addModel = async (req, res) => {
    try {
        if (isEmpty(req.body.model_name)) {
            return res.status(406).json({error_msg: `406`, error_code: "model_name can not be empty"});
        }
        let anModelEntity = new anModel();
        anModelEntity.name = req.body.model_name;
        await anModelEntity.save();
        return res.json({error_msg: `OK`, error_code: "0"});

    } catch (err) {

        if (err.message.toString().search(`duplicate key error`) !== 0) {

            return res.status(409).json({error_msg: `409`, error_code: "model_name can not be duplicated"});
        }
        return res.status(500).json({error_msg: `500`, error_code: "model add Error"});
    }

};
exports.updateModel = async (req, res) => {

    try {
        if (isEmpty(req.body.model_name) || isEmpty(req.body[`new_model_name`])) {
            return res.status(406).json({
                error_msg: `406`,
                error_code: "model_name or new_model_name can not be empty"
            });
        }
        await anModel.findOneAndUpdate({name: req.body.model_name}, {$set: {name: req.body[`new_model_name`]}});
        return res.json({error_msg: `OK`, error_code: "0"});
    } catch (err) {
        if (err.message.toString().search(`duplicate key error`) !== 0) {

            return res.status(409).json({error_msg: `409`, error_code: "model_name can not be duplicated"});
        }
        logger.error(`更新帮助公告模块`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "model add Error"});
    }
};

exports.getModel = async (req, res) => {

    try {
        let result = await anModel.find();
        return res.json({error_msg: `OK`, error_code: "0", data: result});
    } catch (err) {
        if (err.message.toString().search(`duplicate key error`) !== 0) {
            return res.status(409).json({error_msg: `409`, error_code: "model_name can not be duplicated"});
        }
        logger.error(`获取帮助公告模块`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "model add Error"});
    }

};

exports.removeModel = async (req, res) => {
    try {

        if (isEmpty(req.body.model_name)) {
            return res.status(406).json({error_msg: `406`, error_code: "model_name can not be empty"});
        }
        await anModel.deleteOne({name: req.body.model_name});

        return res.json({error_msg: `OK`, error_code: "0"});
    } catch (err) {
        logger.error(`公删除告模块`, {req: req, error: err});
        return res.status(500).json({error_msg: `500`, error_code: "model add Error"});
    }

};


exports.getHelpCenterAnnouncement = async (req, res) => {
    try {
        let resultCenterAnnouncement = await announcementModel.aggregate([
            {
                $match: {model: {$ne: null}}
            },
            {$lookup: {from: 'announcemodels', localField: 'model', foreignField: '_id', as: 'model_name'}},
            {
                $group: {
                    _id: '$model',
                    announcementArray: {$push: "$$ROOT"}
                }
            },
            {
                $project: {
                    _id: 1,
                    model_name: 1,
                    "announcementArray.model_name.name": 1,
                    announcementArray: {
                        announcementID: 1,
                        announcementTopic: 1,
                        announcementLink: 1,
                        content: 1,
                        location: 1
                    }
                }
            }
        ]);
        let resultArray = [];
        for (let entity of resultCenterAnnouncement) {
            let anModelEntity = await anModel.findOne({_id: entity._id});
            resultArray.push({model_name: anModelEntity.name, announcementArray: entity.announcementArray});
        }
        return res.status(200).json({error_msg: `OK`, error_code: "0", data: resultArray});
    } catch (err) {
        logger.error(`公删除告模块`, {req: req, error: err});
        return res.status(503).json({error_msg: `NOT OK`, error_code: "503"});
    }
};


exports.addHelpCenterAnnouncement = async (req, res) => {

    if (isEmpty(req.body.model_name)) {
        return res.status(406).json({error_msg: `406`, error_code: "model_name can not be empty"});
    }
    let anModelEntity;
    let anEntity = await anModel.findOne({name: req.body.model_name});
    if (isEmpty(anEntity)) {
        return res.status(404).json({error_msg: `404`, error_code: "can not find model"});
    } else {
        anModelEntity = anEntity;
    }
    let announcementObject = new announcementModel();
    announcementObject.location = '帮助中心';

    announcementObject.model = anModelEntity._id;
    if (isEmpty(req.body.content)) {
        return res.status(406).json({error_msg: `406`, error_code: "content can not be empty"});
    }
    if (isEmpty(req.body.announcementLink)) {
        return res.status(406).json({error_msg: `406`, error_code: "announcementLink can not be empty"});
    }
    if (isEmpty(req.body.announcementTopic)) {
        return res.status(406).json({error_msg: `406`, error_code: "announcementTopic can not be empty"});
    }

    announcementObject.content = req.body.content;
    announcementObject.announcementLink = req.body.announcementLink.trim();
    announcementObject.announcementTopic = req.body.announcementTopic;
    announcementObject.announcementID = uuidv1();

    announcementObject.save(err => {
        if (err) {
            if (err.message.toString().search(`duplicate key error`) !== 0) {
                return res.status(409).json({
                    error_msg: `409`,
                    error_code: "announcementID, announcementTopic ,announcementLink can not be duplicated"
                });
            }
            logger.error(`addHelpCenterAnnouncement`, {req: req, error: err});
            return res.status(503).json({error_msg: `503`, error_code: "announcement Error"});
        }
        return res.json({error_msg: `OK`, error_code: "0"});

    })
};


exports.addAnnouncement = (req, res) => {

    let announcementObject = new announcementModel();
    if (isEmpty(req.body.location)) {
        return res.status(406).json({error_msg: `406`, error_code: "location can not be empty"});
    }
    if (isEmpty(req.body.announcementLink)) {
        return res.status(406).json({error_msg: `406`, error_code: "announcementLink can not be empty"});
    }
    if (isEmpty(req.body.announcementTopic)) {
        return res.status(406).json({error_msg: `406`, error_code: "announcementTopic can not be empty"});
    }

    announcementObject.location = req.body.location;
    announcementObject.content = req.body.content;
    announcementObject.announcementLink = req.body.announcementLink.trim();
    announcementObject.announcementTopic = req.body.announcementTopic;
    announcementObject.announcementID = uuidv1();

    announcementObject.save(err => {
        if (err) {
            if (err.message.toString().search(`duplicate key error`) !== 0) {

                return res.status(409).json({error_msg: `409`, error_code: "model_name can not be duplicated"});
            }
            logger.error(`addAnnouncement`, {req: req, error: err});
            return res.status(503).json({error_msg: `503`, error_code: "model_name ERROR"});
        }
        return res.status(200).json({error_msg: `OK`, error_code: "0"});
    })
};

exports.delAnnouncement = (req, res) => {

    let item_id = req.body.announcementID;
    announcementModel.deleteOne({announcementID: item_id}, (err) => {
        if (err) {
            return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
        } else {
            return res.status(200).json({error_msg: `OK`, error_code: "0"});
        }
    })
};
