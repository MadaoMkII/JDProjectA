const loggerModel = require('../modules/loggerModel').loggerModel;
const callerId = require('caller-id');
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
                requestBody: req.body,
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
    //await loggerObject.save();
    console.log(loggerEntity)
};
exports.error = async (info, errorBox) => {
    await saveLogger(info, `error`, errorBox, callerId.getData());
};
exports.info = async (info, errorBox) => {
    await saveLogger(info, `info`, errorBox, callerId.getData());
};


exports.logger = this;