const announcementModel = require('../modules/announcement').announcementModel;
const anModel = require('../modules/announcement').announceModel;
const uuidv1 = require('uuid/v1');
const isEmpty = require('../config/tools').isEmpty;

exports.findAnnouncement = async (req, res) => {
    let searchCommand = {};
    if (!isEmpty(req.body.location)) {
        searchCommand.location = req.body.location;
    }
    if (!isEmpty(req.body.announcementID)) {
        searchCommand.announcementID = req.body.announcementID;
    }
    if (!isEmpty(req.body.link)) {
        searchCommand.link = req.body.link;
    }
    if (!isEmpty(req.body.announcementTopic)) {

        searchCommand.announcementTopic = req.body.announcementTopic;
    }
    let operator = {};
    if (isEmpty(req.body['page']) && !isEmpty(req.body['unit'])) {
        operator.skip = (parseInt(req.body['page']) - 1) * parseInt(req.body['unit']);
        operator.limit = parseInt(req.body['unit']);
    }

    announcementModel.find(searchCommand, {
        __v: 0,
        _id: 0
    }, operator, async (err, data) => {
        if (err) {
            return res.status(500).json({error_msg: `500`, error_code: "advertising Error"});
        } else {
            let billCount = await announcementModel.count(searchCommand);
            return res.json({error_msg: `OK`, error_code: "0", data: data, nofdata: billCount});
        }
    })

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
        if (!isEmpty(req.body.link)) {
            searchCommand.link = req.body.link.trim();
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

        return res.json({error_msg: `OK`, error_code: "0", data: returnResult});
    } catch (err) {

        return res.status(500).json({error_msg: `500`, error_code: "announcement Error"});
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
        if (!isEmpty(req.body.link)) {
            searchCommand.link = req.body.link.trim();
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

        return res.status(500).json({error_msg: `500`, error_code: "announcement Error"});
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
        await anModel.findOneAndUpdate(req.body.model_name, {$set: {name: req.body[`new_model_name`]}});
        return res.json({error_msg: `OK`, error_code: "0"});
    } catch (err) {
        return res.status(500).json({error_msg: `500`, error_code: "model add Error"});
    }
};

exports.getModel = async (req, res) => {
    try {

        let result = await anModel.find();
        return res.json({error_msg: `OK`, error_code: "0", data: result});
    } catch (err) {
        return res.status(500).json({error_msg: `500`, error_code: "model add Error"});
    }

};

exports.removeModel = async (req, res) => {
    try {

        if (isEmpty(req.body.model_name)) {
            return res.status(406).json({error_msg: `406`, error_code: "model_name can not be empty"});
        }
        await anModel.remove({name: req.body.model_name});

        return res.json({error_msg: `OK`, error_code: "0"});
    } catch (err) {
        return res.status(500).json({error_msg: `500`, error_code: "model add Error"});
    }

};


exports.getHelpCenterAnnouncement = async (req, res) => {

    let result = await announcementModel.find({location: 'helpCenter'}).populate(`model`);
    return res.status(200).json({error_msg: `OK`, error_code: "0", data: result});
};


exports.addHelpCenterAnnouncement = async (req, res) => {

    if (isEmpty(req.body.model_name)) {
        return res.status(406).json({error_msg: `406`, error_code: "model_name can not be empty"});
    }
    let anModelEntity;
    let anEntity = await anModel.findOne({name: req.body.model_name});
    if (isEmpty(anEntity)) {
        //
    } else {
        anModelEntity = anEntity;
    }
    let announcementObject = new announcementModel();
    announcementObject.location = 'helpCenter';


    announcementObject.model = anModelEntity._id;
    announcementObject.content = req.body.content;
    announcementObject.link = req.body.link.trim();
    announcementObject.announcementTopic = req.body.announcementTopic;
    announcementObject.announcementID = uuidv1();

    announcementObject.save(err => {
        if (err) {
            return res.status(500).json({error_msg: `500`, error_code: "announcement Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0"});
        }
    })
};


exports.addAnnouncement = (req, res) => {

    let announcementObject = new announcementModel();
    announcementObject.location = req.body.location;
    announcementObject.content = req.body.content;
    announcementObject.link = req.body.link.trim();
    announcementObject.announcementTopic = req.body.announcementTopic;
    announcementObject.announcementID = uuidv1();

    announcementObject.save(err => {
        if (err) {

            return res.status(500).json({error_msg: `500`, error_code: "announcement Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0"});
        }
    })
};
//return res.status(403).json({"error_code": 403, error_massage: "Not yet verified"});
exports.delAnnouncement = (req, res) => {

    let item_id = req.body.announcementID;

    announcementModel.remove({announcementID: item_id}, (err) => {
        if (err) {
            return res.status(500).json({error_msg: `500`, error_code: "advertising Error"});
        } else {
            return res.status(200).json({error_msg: `OK`, error_code: "0"});
        }
    })
};
