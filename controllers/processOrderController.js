const processOrderModel = require('../modules/processOrder').processOrderModel;
const dgBillModel = require('../modules/dgBill').dgBillModel;
const isEmpty = require('../config/tools').isEmpty;
const picController = require('../controllers/picController');
exports.addProcessOrder = async (req, res) => {


    try {

        const [returnReq] = await picController.uploadImgAsyncArray(req, res);


        let processOrderObject = new processOrderModel();

        if (isEmpty(req.body[`billID`])) {

            return res.status(400).json({error_msg: `billID is needed`, error_code: "400"});
        }

        for (let img of returnReq.files) {
            processOrderObject.imageFilesNames.push(img.filename);
        }


        processOrderObject.chargeDate = new Date();

        for (let index in req.body) {

            if (!isEmpty(req.body[index])) {

                processOrderObject[index] = req.body[index];
            }
        }
        await processOrderObject.save();
        let dgBillEntity = await dgBillModel.findOneAndUpdate({billID: req.body.billID},
            {$set: {processOrder: processOrderObject._id}}, {new: true}).populate(`processOrder`);
        console.log(processOrderObject);

        return res.status(200).json({error_msg: `OK`, error_code: "0", data: dgBillEntity});

    } catch (e) {
        return res.status(500).json({error_msg: e, error_code: "500"});
    }
};