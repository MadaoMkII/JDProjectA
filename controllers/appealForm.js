const appealFormModel = require('../modules/appealForm').appealFormModel;
const picController = require('../controllers/picController');
const logger = require('../logging/logger');

exports.addAppealForm = (req, res) => {

    picController.uploadImgArray(req, res, () => {

            if (typeof (req.files) === 'undefined') {
                return res.json({error_msg: `403`, error_code: "失败！"});
            }

            let appealFormObject = new appealFormModel();

            appealFormObject.L1_Issue = req.body.L1_Issue;
            appealFormObject.L2_Issue = req.body.L2_Issue;
            appealFormObject.L3_Issue = req.body.L3_Issue;
            appealFormObject.description = req.body.description;
            for (let img of req.files) {
                appealFormObject.imagesFilename.push(img.filename);
            }

            console.log(appealFormObject)
            return res.json({error_msg: `401`, error_code: "GOOD！"});

        }
    )
};