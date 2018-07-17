const mongoose = require('../db/db').mongoose;
let autoIncrement = require('mongoose-auto-increment');

const billStatementSchema = new mongoose.Schema({
    typeStr: {type: String, default: '代付'},
    typeState: Number,  //1表示代付成功，0表示代付失败，2表示链接无效
    dealState: Number,  //1表示交易完成，0表示交易关闭，2表示原路退回
    sendPic: Number,    //1表示显示发送截图按钮，0表示不显示
    payFreight: Number,  //1表示显示补交运费按钮，0表示不显示
    orderID: {
        type: String,
        unique: true,
        uppercase: true // Always convert `orderID` to lowercase
    }, //订单号
    userTelNumber: {type: String, require: true},
    orderAmount: Number,		//订单金额
    rate: Number,		//汇率
    NtdAmount: Number,		//应付台币
    dealDate: Date	//完成时间
})


billStatementSchema.plugin(autoIncrement.plugin, {model: 'billStatement', field: 'billStatementId'});
const billStatementModel = mongoose.model('orderForm', billStatementSchema);
module.exports.billStatementModel = billStatementModel;