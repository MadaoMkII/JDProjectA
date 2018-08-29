const advertisingModel = require('../modules/advertising').advertisingModel;
const picController = require('../controllers/picController');
const logger = require('../logging/logger');
const uuidv1 = require('uuid/v1');

exports.getAdvertising = (req, res) => {
    let searchCommand = {};
    if (req.body.advertisingID) {

        searchCommand.advertisingID = req.body.advertisingID;
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

    picController.uploadImg(req, res, () => {

            if (typeof (req.file) === 'undefined') {
                return res.json({error_msg: `403`, error_code: "失败！"});
            }

            let advertisingObject = new advertisingModel();
            advertisingObject.referer = req.body.referrer;
            advertisingObject.link = req.body.link.trim();
            advertisingObject.filename = req.file.filename;
            advertisingObject.advertisingID = uuidv1();
            advertisingObject.save(err => {
                if (err) {
                    return res.json({error_msg: `400`, error_code: "advertising Error"});
                } else {
                    return res.json({error_msg: `OK`, error_code: "0"});
                }
            })
        }
    )
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