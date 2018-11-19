let TopClient = require('./sdk-nodejs').ApiClient;
var client = new TopClient({
    'appkey': '25260079',
    'appsecret': '70b1bcc4ff485e28a44d5c33e8b3b01c',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});

var url = require('url');
var adr = 'https://item.taobao.com/item.htm?spm=a219t.7900221/10.1998910419.d5d3d3cdd.685475a5ZqdaZl&id=558479490380';
var q = url.parse(adr, true);

console.log(q.host); //returns 'localhost:8080'
console.log(q.pathname); //returns '/default.htm'
console.log(q.query.id); //returns '?year=2017&month=february'



client.execute('taobao.tbk.uatm.favorites.get', {
    'page_no':'1',
    'page_size':'20',
    'fields':'favorites_title,favorites_id,type',
    'type':'1'
}, function(error, response) {
    if (!error) console.log(response.results.tbk_favorites);
    else console.log(error);
})//557572892785
// client.execute('taobao.tbk.uatm.favorites.item.get', {
//     'platform':'1',
//     'page_size':'20',
//     'adzone_id':'57411200488',
//     'unid':'3456',
//     'favorites_id':'18853340',
//     'page_no':'1',
//     'fields':'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,seller_id,volume,nick,shop_title,zk_final_price_wap,event_start_time,event_end_time,tk_rate,status,type'
// }, function(error, response) {
//     if (!error) console.log(response.results);
//     else console.log(error);
// })

client.execute('taobao.tbk.item.info.get', {
    'num_iids':'558479490380',
    'platform':'1',
    'ip':'11.22.33.43'
}, function(error, response) {
    if (!error) console.log(response.results.n_tbk_item);
    else console.log(error);
})

// client.execute('taobao.tbk.item.click.extract', {
//     'click_url':'https://detail.tmall.com/item.htm?spm=a230r.1.14.6.4c3f2ea3adAKh6&id=580513046503&cm_id=140105335569ed55e27b&abbucket=11'
// }, function(error, response) {
//     if (!error) console.log(response);
//     else console.log(error);
// })