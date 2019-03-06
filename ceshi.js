const tool = require('./config/tools');

const chargeBillModel = require('./modules/chargeBill').chargeBillModel;
const dataAnalystModel = require('./modules/dataAnalyst').dataAnalystModel;
const dgBillModel = require('./modules/dgBill').dgBillModel;
let getDataAnalyst = async (req, res) => {
    try {
        let thisDate = new Date();
        let option = req.query.range;
        let matchObject = {}, group = {};

        switch (option) {
            case `day`:
                matchObject = {
                    $match: {
                        thisDay: thisDate.getDate(),
                        thisMonth: thisDate.getMonth() + 1,
                        thisYear: thisDate.getFullYear(),
                        processOrder: {$exists: true, "$ne": null}
                    }
                };
                group = {
                    day: "$thisDay",
                    month: "$thisMonth",
                    year: "$thisYear",
                    typeStr: "$typeStr"
                };
                break;
            case `month`:
                matchObject = {
                    $match: {
                        thisMonth: thisDate.getMonth() + 1,
                        thisYear: thisDate.getFullYear(),
                        processOrder: {$exists: true, "$ne": null}
                    }
                };
                group = {

                    month: "$thisMonth",
                    year: "$thisYear",
                    typeStr: "$typeStr"
                };

                break;
            case `year`:
                matchObject = {
                    $match: {

                        processOrder: {$exists: true, "$ne": null},
                        thisYear: thisDate.getFullYear()
                    }
                };

                group = {
                    year: "$thisYear",
                    typeStr: "$typeStr"
                };

                break;
        }


        let chargeBillRes = await chargeBillModel.aggregate([
            {
                $project: {
                    NtdAmount: "$NtdAmount",
                    processOrder: "$processOrder",
                    typeStr: "$typeStr",
                    thisDay: {$dayOfMonth: '$created_at'},
                    thisMonth: {$month: '$created_at'},
                    thisYear: {$year: '$created_at'}
                }
            },
            matchObject,
            {
                $group: {
                    _id: group,
                    totalPrice: {$sum: `$NtdAmount`},
                    count: {$sum: 1}
                }
            }
        ]);

        let dgBillRes = await dgBillModel.aggregate([
            {
                $project: {
                    NtdAmount: "$NtdAmount",
                    processOrder: "$processOrder",
                    typeStr: "$typeStr",
                    thisDay: {$dayOfMonth: '$created_at'},
                    thisMonth: {$month: '$created_at'},
                    thisYear: {$year: '$created_at'}
                }
            },
            matchObject,
            {
                $group: {
                    _id: group,
                    totalPrice: {$sum: `$NtdAmount`},
                    count: {$sum: 1}
                }
            }
        ]);

        chargeBillRes = chargeBillRes.concat(dgBillRes);

        let dataAnalystMap = new Map(), finalArray = [];

        dataAnalystMap.set('R幣儲值', {count: 0, totalAmount: 0});
        dataAnalystMap.set('支付寶儲值', {count: 0, totalAmount: 0});
        dataAnalystMap.set('微信錢包儲值', {count: 0, totalAmount: 0});
        dataAnalystMap.set('其他網站代購', {count: 0, totalAmount: 0});
        dataAnalystMap.set('淘寶/天貓/阿里巴巴代付', {count: 0, totalAmount: 0});


        for (let entity of chargeBillRes) {
            dataAnalystMap.set(entity._id.typeStr, {
                count: entity.count,
                totalAmount: Math.ceil(Number(entity.totalPrice))
            });

        }
        dataAnalystMap.forEach((value, key) => {

            finalArray.push(Object.assign(value, {itemWebType: key}));

        });
        console.log(finalArray)
        return res.status(200).json({error_msg: 'OK', error_code: "0", data: finalArray});
    } catch (err) {
        logger.error(`获取数据分析`, {req: req, error: err.message});
        return res.status(503).json({error_msg: err, error_code: "503"});
    }
};
// 1，前端交互 扣多少
// 2，走对公开票 增值税3个点  企业所得,10
// 3，2.5 （现在）
// 4，付款形式速度 需要开票时间
getDataAnalyst();