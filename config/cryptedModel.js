const crypto = require('crypto');
var url = require('url');
const managerConfigsModel = require('../modules/managerConfigFeatures').managerConfigsModel;
//加密
let cipher = function (key, buf) {
    let encrypted = "";
    let cip = crypto.createCipher(`DES`, key);
    encrypted += cip.update(buf, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted
};

//解密
let decipher = function (key, encrypted) {
    let decrypted = "";
    let decipher = crypto.createDecipher(`DES`, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted
};
let key = 'nihao';
let uul = 'https://item.taobao.com/item.htm?spm=a217h.9580640.831217.1.4c5225aaf8Xg9t&id=563318666714&scm=1007.12144.81309.70043_0&pvid=9fae5903-1c30-4a38-be56-1611f8817862&utparam=%7B%22x_hestia_source%22%3A%2270043%22%2C%22x_mt%22%3A8%2C%22x_object_id%22%3A563318666714%2C%22x_object_type%22%3A%22item%22%2C%22x_pos%22%3A1%2C%22x_pvid%22%3A%229fae5903-1c30-4a38-be56-1611f8817862%22%2C%22x_src%22%3A%2270043%22%7D'
let x = cipher('DES', key, 'xiawanyu')

var adr = 'http://localhost:8080/default.htm?year=2017&month=february';
var q = url.parse(uul, true);



// const  TopClient = require('topsdk');
// var client = new TopClient({
//     'appkey': 'appkey',
//     'appsecret': 'secret',
//     'REST_URL': 'http://gw.api.taobao.com/router/rest'
// });
//
// client.execute('taobao.tbk.item.get', {
//     'fields':'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,seller_id,volume,nick',
//     'q':'女装',
//     'cat':'16,18',
//     'itemloc':'杭州',
//     'sort':'tk_rate_des',
//     'is_tmall':'false',
//     'is_overseas':'false',
//     'start_price':'10',
//     'end_price':'10',
//     'start_tk_rate':'123',
//     'end_tk_rate':'123',
//     'platform':'1',
//     'page_no':'123',
//     'page_size':'20'
// }, function(error, response) {
//     if (!error) console.log(response);
//     else console.log(error);
// })
// const userModel = require('../modules/userAccount').userAccountModel;
// let av = async () => {
//
//     try {
//         let settings = await userModel.findOne().sort('-created_at');
//         console.log(settings)
//         console.log(123444)
//
//
//     } catch (error) {
//
//         return {error}
//
//     }
// };
let a= new managerConfigsModel({  rate:0.2,  aliPayAccounts:[ `abc`,`bfe`,`asd`    ]  });
a.save()