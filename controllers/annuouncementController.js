const announcementModel = require('../modules/announcement').announcementModel;
const uuidv1 = require('uuid/v1');
const isEmpty = require('../config/tools').isEmpty;

exports.findAnnouncement = (req, res) => {
    let searchCommand = {};
    if (!isEmpty(req.body.model_name)) {
        searchCommand.model_name = req.body.model_name;
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
        operator.skip = parseInt(req.body['page']) * parseInt(req.body['unit']);
        operator.limit = parseInt(req.body['unit']);
    }

    announcementModel.find(searchCommand, {
        __v: 0,
        _id: 0
    }, operator, (err, data) => {
        if (err) {
            return res.json({error_msg: `400`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.updateAnnouncement = (req, res) => {
    let searchCommand = {};
    if (!isEmpty(req.body.model_name)) {
        searchCommand.model_name = req.body.model_name;
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
    announcementModel.findOneAndUpdate({announcementID: req.body['announcementID']}, {
        $set: searchCommand
    }, {new: true}, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(400).json({error_msg: `400`, error_code: "announcemen Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })
};

exports.addAdvertising = (req, res) => {

    let announcementObject = new announcementModel();
    announcementObject.model_name = req.body.model_name;
    announcementObject.content = req.body.content;
    announcementObject.link = req.body.link.trim();
    announcementObject.announcementTopic = req.body.announcementTopic;
    announcementObject.announcementID = uuidv1();

    announcementObject.save(err => {
        if (err) {
            console.log(err)
            return res.status(400).json({error_msg: `400`, error_code: "announcemen Error"});
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
            return res.json({error_msg: `400`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0"});
        }
    })
};
