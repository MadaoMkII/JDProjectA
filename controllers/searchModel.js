const tool = require('../config/tools');
const isEmpty = require('../config/tools').isEmpty;
exports.pageModel = (req) => {

    // let operator = {sort: {updated_at: -1}};
    let operator = {};
    if (!tool.isEmpty(req.body['page']) && !tool.isEmpty(req.body['unit'])) {
        if (req.body['page'] < 1 || req.body['unit'] < 1) {
            throw new Error(`page or unit can not less than 1`);
        }
        operator.skip = (parseInt(req.body['page']) - 1) * parseInt(req.body['unit']);
        operator.limit = parseInt(req.body['unit']);
    }
    return operator;
};
exports.combinedPageModel = (req, res) => {
    try {
        let new_operator = {};

        if (!tool.isEmpty(req.body['page']) && !tool.isEmpty(req.body['unit'])) {
            if (req.body['page'] < 1 || req.body['unit'] < 1) {
                throw new Error(`page or unit can not less than 1`);

            }

            let skip = (parseInt(req.body['page']) - 1) * Math.round(parseInt(req.body['unit'] / 2));
            let limit = Math.round(parseInt(req.body['unit'] / 2));
            new_operator = {skip: skip, limit: limit};
        }
        return new_operator;
    } catch (err) {
        throw new Error(err.message);
    }
    // let operator = {sort: {updated_at: -1}};

};
exports.reqSearchConditionsAssemble = (req, ...conditions) => {
    let searchConditions = {};
    for (let entity of conditions) {
        if (entity.require === true && tool.isEmpty(req.body[`${entity.filedName}`])) {

            throw new Error(`field ${entity.filedName} can not be empty`);
        }
        if (entity.filedName === `userUUID` && entity.custom === false) {
            searchConditions[`userUUID`] = req.user.uuid;
        } else if (entity.filedName === `uuid`) {
            searchConditions[`uuid`] = req.user.uuid;
        } else if (!tool.isEmpty(req.body[`${entity.filedName}`])) {
            searchConditions[`${entity.filedName}`] = req.body[`${entity.filedName}`];

        }

    }
    return searchConditions;
};
exports.requestCheckBox = (req, ...conditions) => {

    for (let entity of conditions) {

        if (entity.includes('.')) {

            if (tool.isEmpty(req.body[`${entity.split(".")[0]}`][entity.split(".")[1]])) {

                throw new Error(`field ${entity} can not be empty`);
            }
        } else {
            if (tool.isEmpty(req.body[`${entity}`])) {

                throw new Error(`field ${entity} can not be empty`);
            }
        }
    }
};
exports.createAndUpdateTimeSearchModel = (req) => {

    let command = {};


    if (!isEmpty(req.body['createdAt'])) {

        if (!isEmpty(req.body[`createdAt`]['beforeDate']) && !isEmpty(req.body[`createdAt`]['afterDate']) &&
            new Date(req.body[`createdAt`]['beforeDate']) < new Date(req.body[`createdAt`]['afterDate'])) {
            throw new Error('beforeDate can not less than afterDate');
        }

        if (!isEmpty(req.body[`createdAt`]['beforeDate'])) {
            command['created_at'] = {};
            command['created_at']["$lte"] = new Date(req.body[`createdAt`]['beforeDate']);
        }

        if (!isEmpty(req.body[`createdAt`]['afterDate'])) {
            if (!isEmpty(command['created_at'])) {
                command['created_at']["$gte"] = new Date(req.body[`createdAt`]['afterDate']);
            } else {
                command['created_at'] = {};
                command['created_at'] = {$gte: new Date(req.body[`createdAt`]['afterDate'])};
            }

        }

    }
    if (!isEmpty(req.body['updatedAt'])) {

        if (!isEmpty(req.body[`updatedAt`]['beforeDate']) && !isEmpty(req.body[`updatedAt`]['afterDate']) &&
            req.body[`updatedAt`]['beforeDate'] < req.body[`updatedAt`]['afterDate']) {
            new Error('beforeDate can not less than afterDate');
        }

        if (!isEmpty(req.body[`updatedAt`]['beforeDate'])) {
            command['updated_at'] = {};
            command['updated_at'][`$lte`] = new Date(req.body[`updatedAt`]['beforeDate']);
        }
        if (!isEmpty(req.body[`updatedAt`]['afterDate'])) {
            if (!isEmpty(command['created_at'])) {
                command['updated_at']["$gte"] = new Date(req.body[`updatedAt`]['afterDate']);
            } else {
                command['updated_at'] = {};
                command['updated_at'] = {$gte: new Date(req.body[`updatedAt`]['afterDate'])};
            }
        }

    }
    return command;
};
