const tool = require('../config/tools');
const isEmpty = require('../config/tools').isEmpty;
exports.pageModel = (req, res) => {

    let operator = {sort: {updated_at: -1}};
    if (!tool.isEmpty(req.body['page']) && !tool.isEmpty(req.body['unit'])) {
        if (req.body['page'] < 1) {
            return res.status(400).send({error_code: 400, error_msg: `page can not less than 1`});
        }
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
exports.createAndUpdateTimeSearchModel = (req, res) => {

    let command = {};
    if (!isEmpty(req.body['createdAt'])) {
        if (!isEmpty(req.body[`createdAt`]['beforeDate']) && !isEmpty(req.body[`createdAt`]['afterDate']) &&
            req.body[`createdAt`]['beforeDate'] < req.body[`createdAt`]['afterDate']) {
            return res.status(400).send({error_code: 400, error_msg: 'beforeDate can not less than afterDate'});
        }

        if (!isEmpty(req.body[`createdAt`]['beforeDate'])) {
            command['created_at'] = {$lte: new Date(req.body[`createdAt`]['beforeDate'])};
        }


        if (!isEmpty(req.body[`createdAt`]['afterDate'])) {
            command['created_at'] = {$gte: new Date(req.body[`createdAt`]['afterDate'])};
        }

    }
    if (!isEmpty(req.body['updatedAt'])) {

        if (!isEmpty(req.body[`updatedAt`]['beforeDate']) && !isEmpty(req.body[`updatedAt`]['afterDate']) &&
            req.body[`updatedAt`]['beforeDate'] < req.body[`updatedAt`]['afterDate']) {
            return res.status(400).send({error_code: 400, error_msg: 'beforeDate can not less than afterDate'});
        }
        if (!isEmpty(req.body[`updatedAt`]['beforeDate'])) {
            command['updated_at'] = {$lte: new Date(req.body[`updatedAt`]['beforeDate'])};
        }
        if (!isEmpty(req.body[`updatedAt`]['afterDate'])) {
            command['updated_at'] = {$gte: new Date(req.body[`updatedAt`]['afterDate'])};
        }
    }
    return command;
};
