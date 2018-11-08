let TopClient = require('topsdk');
var client = new TopClient({
    'appkey': '25260079',
    'appsecret': '70b1bcc4ff485e28a44d5c33e8b3b01c',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});

client.execute('taobao.tbk.item.get', {
    'fields':'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,seller_id,volume,nick',
    'q':'女装',
    'cat':'16,18',
    'itemloc':'杭州',
    'sort':'tk_rate_des',
    'is_tmall':'false',
    'is_overseas':'false',
    'start_price':'10',
    'end_price':'10',
    'start_tk_rate':'123',
    'end_tk_rate':'123',
    'platform':'1',
    'page_no':'123',
    'page_size':'20'
}, function(error, response) {
    if (!error) console.log(response);
    else console.log(error);
})