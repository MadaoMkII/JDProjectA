const tool = require('../config/tools');

exports.pageModel = (req) => {

    let operator = {sort: {updated_at: -1}};
    if (!tool.isEmpty(req.body['page']) && !tool.isEmpty(req.body['unit'])) {
        operator.skip = (parseInt(req.body['page']) - 1) * parseInt(req.body['unit']);
        operator.limit = parseInt(req.body['unit']);
    }
    return operator;
};

exports.reqSearchConditionsAssemble = (req, ...conditions) => {
    let searchConditions = {};
    for (let entity of conditions) {
        if (entity.require === true && tool.isEmpty(req.body[`${entity.filedName}`])) {

            throw new Error(`field ${entity.filedName} can not be empty`);
        }
        if (entity.filedName === `uuid`) {
            searchConditions[`uuid`] = req.user.uuid;
        } else {
            searchConditions[`${entity.filedName}`] = req.body[`${entity.filedName}`];
        }

    }


    return searchConditions;
};
exports.createAndUpdateTimeSearchModel = (req) => {

    let command = {};
    if (!tool.isEmpty(req.body['updatedAt'])) {
        command['updated_at'] = {};
        if (!tool.isEmpty(req.body[`updatedAt`]['beforeDate'])) {
            command['updated_at'].$lte = new Date(req.body[`updatedAt`]['beforeDate']);
        }
        if (!tool.isEmpty(req.body[`updatedAt`]['afterDate'])) {
            command['updated_at'].$gte = new Date(req.body[`updatedAt`]['afterDate']);
        }
    }
    if (!tool.isEmpty(req.body['createdAt'])) {
        command['created_at'] = {};
        if (!tool.isEmpty(req.body[`createdAt`]['beforeDate'])) {
            command['created_at'].$lte = new Date(req.body[`createdAt`]['beforeDate']);
        }
        if (!tool.isEmpty(req.body[`createdAt`]['afterDate'])) {
            command['created_at'].$gte = new Date(req.body[`createdAt`]['afterDate']);
        }
    }
    return command;
};
