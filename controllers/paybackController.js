let TopClient = require('../sdk-nodejs').ApiClient;
let url = require('url');
const tool = require('../config/tools');

const client = new TopClient({
    'appkey': '25260079',
    'appsecret': '70b1bcc4ff485e28a44d5c33e8b3b01c',
    'REST_URL': 'http://gw.api.taobao.com/router/rest'
});


let getItemInfo = (urlLink) => {

    return new Promise((resolve, reject) => {

        let itemID = url.parse(urlLink, true).query.id;

        client.execute('taobao.tbk.item.info.get', {
            'num_iids': itemID,
            'outer_code': `GUNDAM`,
            'platform': '1',
            'ip': '11.22.33.43'
        }, (err, data) => {

            if (err) {
                reject(err);
            }
            if (!tool.isEmpty(data.results)) {
                resolve(data.results[`n_tbk_item`]);
            } else {
                resolve(null);
            }
        })
    })
};

let xRunner = (async () => {
    let ob = await getItemInfo('https://item.taobao.com/item.htm?spm=a219t.7900221/10.1998910419.d5d3d3cdd.685475a5ZqdaZl&id=558479490380');
    console.log(ob[0]);
})();
exports.getThisUserPayback = async (req, res) => {
    let resultArray2 = [
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        },
        {
            taobaoOrderID: `00296871994`,
            email_address: `nihao@126.com`,
            orderStatus: `running`,
            paybackAmount: 300,
            paybackStatus: 1,
            RcoinReturn: 12,
            dealDate: `2018-09-60`
        }

    ];

    return res.status(200).send({
        error_code: 0, error_msg: "OK", data: resultArray2, nofdata: count
    });

};