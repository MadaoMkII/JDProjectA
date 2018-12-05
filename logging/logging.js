const loggerModel = require('../modules/loggerModel').loggerModel;
const callerId = require('caller-id');
const searchModel = require('../controllers/searchModel');

let saveLogger = async (infoCustom, level, errorBox, callerInfo) => {
    let loggerEntity = {};
    if (errorBox) {
        let req = errorBox.req, error = errorBox.error,
            specialResponse = errorBox[`specialResponse`];

        if (req && req.user) {
            loggerEntity = {
                info: infoCustom,
                userRole: req.user.role,
                level: level,
                API_response: specialResponse,
                userInfo: {email_address: req.user.email_address, tel_number: req.user.tel_number, uuid: req.user.uuid},
                functionName: callerInfo.functionName,
                filePath: callerInfo.filePath,
                lineNumber: callerInfo.lineNumber,
                requestBody: req ? req.body : undefined,
                error: error
            }
        } else {
            loggerEntity = {
                info: infoCustom,
                level: level,
                API_response: specialResponse,
                functionName: callerInfo.functionName,
                filePath: callerInfo.filePath,
                lineNumber: callerInfo.lineNumber,
                requestBody: req ? req.body : undefined,
                error: error
            }
        }
    } else {
        loggerEntity = {
            info: infoCustom,
            level: level,
            functionName: callerInfo.functionName,
            filePath: callerInfo.filePath,
            lineNumber: callerInfo.lineNumber
        }
    }
    let loggerObject = new loggerModel(loggerEntity);
    await loggerObject.save();
};
exports.error = async (info, errorBox) => {
    await saveLogger(info, `error`, errorBox, callerId.getData());
};
exports.info = async (info, errorBox) => {
    await saveLogger(info, `info`, errorBox, callerId.getData());
};

exports.warn = async (info, errorBox) => {
    await saveLogger(info, `warning`, errorBox, callerId.getData());
};

exports.getLogger = async (req, res) => {
    try {
        let operator = await searchModel.pageModel(req);
        let command = {};
        command.showCondition = {
            __v: 0,
            _id: 0
        };

        command.searchCondition = searchModel.reqSearchConditionsAssemble(req,
            {"filedName": `level`, "require": false}
        );

        command.searchCondition = Object.assign(command.searchCondition, searchModel.createAndUpdateTimeSearchModel(req));

        let result = await loggerModel.find(command.searchCondition, command.showCondition, operator);

        let billCount = await loggerModel.countDocuments(command.searchCondition);
        return res.status(200).send({error_code: 200, error_msg: `OK`, data: result, nofdata: billCount});
    } catch (err) {

        return res.status(503).send({error_code: 503, error_msg: err.message});
    }

};


exports.logger = this;