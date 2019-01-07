const manageSettingController = require('../controllers/manageSettingController');
const friendAccountsModel = require('../modules/friendAccounts').friendAccountsModel;
const logger = require('../logging/logging').logger;

class AccountsController {


    getTodayDate() {

        return this.todayDate;
    }

    constructor() {
        this.todayDate = {};
        let myDate = new Date();
        this.todayDate = new Date(`${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate() + 1}`);
    };

    async init() {
        this.managerConfig = [];
        let recentAccount = await friendAccountsModel.findOne({dateClock: this.todayDate});
        if (!recentAccount || recentAccount.accounts.length === 0) {
            let accountList = [];
            this.managerConfig = await manageSettingController.findCurrentSetting();
            this.managerConfig.friendAccount.split(",").forEach((obj) => {
                accountList.push({amount: 18000, accountName: obj})
            });

            await friendAccountsModel.updateOne({dateClock: this.todayDate},
                {accounts: accountList}, {upsert: true});

        }
        return this;
    };

    // async getTodayDaa() {
    //     try {
    //
    //
    //
    //         let orderedAccountArray = result.accounts.sort((a, b) => {
    //             return b.amount - a.amount
    //         });
    //         let filteredArray = orderedAccountArray.filter((value) => {
    //             return value.amount > 0;
    //
    //         });
    //         });
    //
    //     } catch (err) {
    //         console.log(1111)
    //     }
    //
    //
    // };


}

exports.reduceBalance = async (amount, friendAccount) => {
    let date = new AccountsController().getTodayDate();

    await friendAccountsModel.findOneAndUpdate({"accounts.accountName": friendAccount, dateClock: date},
        {$inc: {"accounts.$.amount": -amount}}, {new: true});
};


exports.getFriendAccount = async (req, res) => {
    try {

        let friendObj = await new AccountsController().init();
        let result = await friendAccountsModel.findOne({dateClock: friendObj.getTodayDate()}, {
            "accounts.amount": 1,
            "accounts.accountName": 1
        });

        let orderedAccountArray = result.accounts.sort((a, b) => {
            return b.amount - a.amount
        });

        let filteredArray = orderedAccountArray.filter((value) => {
            return value.amount > 0;
        });

        return res.status(200).json({
            error_msg: `OK`,
            error_code: "0",
            data: filteredArray[0].accountName
        });
    } catch (err) {
        logger.error(`getFriendAccount`, {req: req, error: err.message});
        return res.status(503).json({error_msg: `503`, error_code: "getFriendAccount Error"});
    }
};
