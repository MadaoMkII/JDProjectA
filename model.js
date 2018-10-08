const userModel = require('./modules/userAccount').userAccountModel;
const searchModel = require('./controllers/searchModel');


let req = {};
req[`body`] = {"a1": 123, "a2": 456};

try {
    console.log(searchModel.searchConditionsAssemble(req, {"filedName": `a3`, "require": true}, {
        "filedName": `a2`,
        "require": false
    }));
}catch (e) {
    console.log(e)
}
