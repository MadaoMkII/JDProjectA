const advertisingModel = require('../modules/advertising').advertisingModel;
const picController = require('../controllers/picController');
const uuidv1 = require('uuid/v1');
const isEmpty = require('../config/tools').isEmpty;

exports.setHomepage = (req, res) => {
    let searchCommand = {};

    searchCommand.L1_category = `首页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `5e6da9c0-c7ea-11e8-a64e-5b52debd6872`;
    advertisingModel.findOneAndUpdate(searchCommand, {$set: {imageLink: req.body.imageLink}}, {
        upsert: true,
        new: true
    }, (err, data) => {
        if (err) {
            return res.json({error_msg: `400`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.getHomepage = (req, res) => {
    let searchCommand = {};
    searchCommand.L1_category = `首页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `5e6da9c0-c7ea-11e8-a64e-5b52debd6872`;


    advertisingModel.find(searchCommand, (err, data) => {
        if (err) {
            return res.json({error_msg: `400`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.findAdvertising = (req, res) => {
    let searchCommand = {};
    if (!isEmpty(req.body.advertisingID)) {

        searchCommand.advertisingID = req.body.advertisingID;
    }
    if (!isEmpty(req.body.L1_category)) {

        searchCommand.L1_category = req.body.L1_category;
    }
    if (!isEmpty(req.body.L2_category)) {

        searchCommand.L2_category = req.body.L2_category;
    }
    if (!isEmpty(req.body.referer)) {

        searchCommand.referer = req.body.referer;
    }

    advertisingModel.find(searchCommand, (err, data) => {
        if (err) {
            return res.json({error_msg: `400`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};

exports.addAdvertising = (req, res) => {


    let advertisingObject = new advertisingModel();
    advertisingObject.referer = req.body.referrer;
    advertisingObject.L1_category = req.body.L1_category;
    advertisingObject.L2_category = req.body.L2_category;
    advertisingObject.advertisingLink = req.body.advertisingLink;
    advertisingObject.imageLink = req.body.imageLink;
    advertisingObject.item_name = req.body.item_name;
    advertisingObject.topic = req.body.topic;
    advertisingObject.advertisingID = uuidv1();
    advertisingObject.save(err => {
        if (err) {
            console.log(err)
            if (err.message.toString().includes(`duplicate`)) {
                return res.status(400).json({error_msg: `400`, error_code: "advertisingLink can not be duplicated"});
            }
            return res.status(500).json({error_msg: `500`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0"});
        }
    })
};
//return res.status(403).json({"error_code": 403, error_massage: "Not yet verified"});
exports.delAdvertising = (req, res) => {

    picController.deleteImgs(req, res, () => {

            let item_id = req.body.advertisingID;

            advertisingModel.remove({advertisingID: item_id}, (err) => {
                if (err) {
                    return res.json({error_msg: `400`, error_code: "advertising Error"});
                } else {
                    return res.json({error_msg: `OK`, error_code: "0"});
                }
            })
        }
    )
};