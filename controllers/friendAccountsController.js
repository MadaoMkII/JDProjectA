const manageSettingController = require('../controllers/manageSettingController');

class AccountsController {


    constructor() {
        this.accountList = {};
        this.managerConfig = [];
    }

    async init() {
        this.managerConfig = await manageSettingController.findCurrentSetting();
        this.accountList = [];

        this.managerConfig.friendAccount.split(",").forEach((obj) => {
            this.accountList.push({amount: 18000, accountName: obj})
        });
        console.log(this.accountList)
    }

    print() {
        console.log(this.accountList);
    }
}


module.exports = AccountsController;