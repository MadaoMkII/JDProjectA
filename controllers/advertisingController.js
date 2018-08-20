const advertisingModel = require('../modules/advertising').advertisingModel;
const picController = require('../controllers/picController');
const logger = require('../logging/logger');

exports.addces = (req, res) => {

    picController.uploadImgArray(req, res, () => {

            if (typeof (req.files) === 'undefined') {
                return res.json({error_msg: `403`, error_code: "失败！"});
            }

            let advertisingObject = new advertisingModel();
            advertisingObject.referer = req.body.referrer;
            advertisingObject.link = req.body.link;

            for (let img of req.files) {
                console.log(img)
                advertisingObject
            }
            console.log(advertisingObject)
            return res.json({error_msg: `401`, error_code: "GOOD！"});

        }
    )
};
exports.addAdvertising = (req, res) => {

    picController.uploadImg(req, res, () => {

            if (typeof (req.file) === 'undefined') {
                return res.json({error_msg: `403`, error_code: "失败！"});
            }

            let advertisingObject = new advertisingModel();
            advertisingObject.referer = req.body.referrer;
            advertisingObject.link = req.body.link;
            advertisingObject.imageName = req.file.filename;

            advertisingObject.save(err => {
                if (err) {
                    return res.json({error_msg: `111`, error_code: "111"});
                } else {
                    return res.json({error_msg: `OK`, error_code: "0"});
                }


            })
        }
    )
};
//return res.status(403).json({"error_code": 403, error_massage: "Not yet verified"});