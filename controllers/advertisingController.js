const advertisingModel = require('../modules/advertising').advertisingModel;
const uuidv1 = require('uuid/v1');
const isEmpty = require('../config/tools').isEmpty;
const searchModel = require('../controllers/searchModel');
const logger = require('../logging/logging').logger;

exports.getDFpage = (req, res) => {
    let searchCommand = {};
    searchCommand.L1_category = `代付页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `91f43ba0-c863-11e8-8ab2-055a1fa329cb`;


    advertisingModel.findOne(searchCommand, {
        "L1_category": 0,
        "L2_category": 0,
        created_at: 0,
        updated_at: 0,
        advertisingID: 0
    }, (err, data) => {
        if (err) {
            logger.error(`代付页头图`, {req: req, error: err});
            return res.status(503).json({error_msg: err.message, error_code: "503"});
        } else {
            return res.status(200).json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.setDFpage = (req, res) => {
    let searchCommand = {};

    searchCommand.L1_category = `代付页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `91f43ba0-c863-11e8-8ab2-055a1fa329cb`;
    if (isEmpty(req.body.imageLink)) {
        return res.status(404).json({error_msg: `404`, error_code: "没有获取到imageLink,你的POST请求体为" + req.body});
    }

    advertisingModel.findOneAndUpdate(searchCommand, {$set: {imageLink: req.body.imageLink}}, {
        upsert: true,
        new: true
    }, (err, data) => {

        logger.info("设置首页图片", {
            req: req
        });

        if (err) {
            logger.error(`设置首页图片`, {req: req, error: err});
            return res.status(503).json({error_code: `503`, error_msg: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })
};
exports.setHomepage = (req, res) => {
    let searchCommand = {};

    searchCommand.L1_category = `首页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `5e6da9c0-c7ea-11e8-a64e-5b52debd6872`;
    if (isEmpty(req.body.imageLink)) {
        return res.status(404).json({error_msg: `404`, error_code: "没有获取到imageLink,你的POST请求体为" + req.body});
    }


    advertisingModel.findOneAndUpdate(searchCommand, {$set: {"imageLink": req.body.imageLink}}, {
        upsert: true,
        new: true
    }, (err, data) => {

        if (err) {
            logger.error(`设置首页头图`, {req: req, error: err});
            return res.status(503).json({error_code: `503`, error_msg: "advertising Error"});
        } else {
            logger.info("设置首页头图", {req: req});
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.getHomepage = (req, res) => {
    let searchCommand = {};
    searchCommand.L1_category = `首页`;
    searchCommand.L2_category = `头图`;
    searchCommand.advertisingID = `5e6da9c0-c7ea-11e8-a64e-5b52debd6872`;


    advertisingModel.findOne(searchCommand, {
        "L1_category": 0,
        "L2_category": 0
    }, (err, data) => {
        if (err) {
            logger.error(`首页头图`, {req: req, error: err});
            return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
        } else {
            return res.json({error_msg: `OK`, error_code: "0", data: data});
        }
    })

};
exports.getHomepageItemsList = async (req, res) => {

    try {
        let operator = searchModel.pageModel(req, res);
        operator = Object.assign(operator, {sort: {priority: 1}});

        let count = await advertisingModel.countDocuments({L1_category: "首页", L2_category: "商品推荐"});
        let result = await advertisingModel.find({L1_category: "首页", L2_category: "商品推荐"}, {
            item_name: 1,
            referer: 1,
            priority: 1, advertisingID: 1
        }, operator);

        return res.json({error_msg: `OK`, error_code: "0", data: result, nofdata: count});

    } catch (err) {
        logger.error(`HomepageItemsList`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
    }
};

exports.getHomepageItems = async (req, res) => {

    try {
        let operator = searchModel.pageModel(req, res);
        operator = Object.assign(operator, {sort: {priority: 1}});

        let count = await advertisingModel.countDocuments({L1_category: "首页", L2_category: "商品推荐"});
        let result = await advertisingModel.find({L1_category: "首页", L2_category: "商品推荐"}, {
            L2_category: 0,
            L1_category: 0
        }, operator);

        return res.status(200).json({error_msg: `OK`, error_code: "0", data: result, nofdata: count});

    } catch (err) {
        logger.error(`HomepageItemsList`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
    }
};

exports.addHomepageItems = (req, res) => {

    let advertisingObject = new advertisingModel();
    advertisingObject.referer = req.body.referrer;
    advertisingObject.L1_category = "首页";
    advertisingObject.L2_category = "商品推荐";
    advertisingObject.advertisingLink = req.body.advertisingLink;
    advertisingObject.imageLink = req.body.imageLink;
    advertisingObject.item_name = req.body.item_name;
    advertisingObject.price = req.body.price;
    advertisingObject.priority = req.body.priority;

    if (isNaN(req.body.price) || req.body.price < 0) {
        return res.status(400).json({error_msg: `400`, error_code: "price must be a Number and bigger than 0"});
    }
    advertisingObject.advertisingID = uuidv1();
    advertisingObject.save(err => {
        if (err) {
            logger.error(`设置首页商品列表`, {req: req, error: err});

            if (err.message.toString().includes(`duplicate`)) {
                return res.status(400).json({error_msg: `400`, error_code: "advertisingLink can not be duplicated"});
            }
            return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
        } else {
            logger.info("设置首页商品列表", {req: req});
            return res.json({error_msg: `OK`, error_code: "0"});
        }
    })
};

exports.delAdvertising = (req, res) => {

    let item_id = req.body.advertisingID;

    advertisingModel.deleteOne({advertisingID: item_id}, (err) => {
        if (err) {
            logger.error(`删除广告`, {req: req, error: err});
            return res.status(503).json({error_msg: `503`, error_code: "advertising Error"});
        } else {
            return res.status(200).json({error_msg: `OK`, error_code: "0"});
        }
    });

};

exports.errorTest = (req, res) => {


    try {
        logger.info("设置首页图片", {
            req: req
        });
        throw new Error(`wokanhaoni`)
    } catch (err) {
        logger.error(`API Error`, {req: req, error: err});
        return res.json({error_msg: `400`, error_code: "advertising Error"});
    }


}