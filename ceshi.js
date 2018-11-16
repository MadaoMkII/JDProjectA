let TopClient = require('./sdk-nodejs').ApiClient;
var client = new TopClient({
    'appkey': '25260079',
    'appsecret': '70b1bcc4ff485e28a44d5c33e8b3b01c',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});
client.execute('taobao.tbk.uatm.favorites.get', {
    'page_no':'1',
    'page_size':'20',
    'fields':'favorites_title,favorites_id,type',
    'type':'1'
}, function(error, response) {
    if (!error) console.log(response.results.tbk_favorites);
    else console.log(error);
})
client.execute('taobao.tbk.uatm.favorites.item.get', {
    'platform':'1',
    'page_size':'20',
    'adzone_id':'57411200488',
    'unid':'3456',
    'favorites_id':'18853340',
    'page_no':'1',
    'fields':'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,seller_id,volume,nick,shop_title,zk_final_price_wap,event_start_time,event_end_time,tk_rate,status,type'
}, function(error, response) {
    if (!error) console.log(response.results);
    else console.log(error);
})