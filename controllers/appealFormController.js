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
