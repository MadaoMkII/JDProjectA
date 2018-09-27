const tools = require("./config/tools");

var debug = require('debug');
var error = debug('app:error');

// by default stderr is used
error('goes to stderr!');

var log = debug('app:log');
// set this namespace to log via console.log
log.log = console.log.bind(console); // don't forget to bind to console!
log('goes to stdout');
error('still goes to stderr!');

// set all output to go via console.info
// overrides all per-namespace log settings
debug.log = console.info.bind(console);
error('now goes to stdout via console.info');
log('still goes to stdout, but via console.info now');

const dataAnalystModel = require('./modules/dataAnalyst').dataAnalystModel;
console.log(tools.encrypt(198 ))
let ccceshi = async () => {

    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2014-05-01`),
        itemWebType: `天猫淘宝代付`
    }, {$inc: {count: 1, amount: 110}}, {new: true, upsert: true});
    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2018-11-11`),
        itemWebType: `阿里巴巴代付`
    }, {$inc: {count: 5, amount: 1210}}, {new: true, upsert: true});
    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2014-11-21`),
        itemWebType: `代付`
    }, {$inc: {count: 39, amount: 18800}}, {new: true, upsert: true});
    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2016-04-10`),
        itemWebType: `代付`
    }, {$inc: {count: 89, amount: 58910}}, {new: true, upsert: true});
    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2016-10-01`),
        itemWebType: `代付`
    }, {$inc: {count: 1121, amount: 1105884}}, {new: true, upsert: true});
    await dataAnalystModel.findOneAndUpdate({
        dateClock:new Date(`2015-05-21`),
        itemWebType: `代付`
    }, {$inc: {count: 601, amount: 15890}}, {new: true, upsert: true});


}
ccceshi();