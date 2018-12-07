const request = require('request');
let requestFun = (JSONObject, method, url) => {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: method,
            json: true,   // <--Very important!!!
            body: JSONObject
        }, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                resolve([response, body]);
            }
        });
    });
};


exports.receiveCardRequest = async (req, res) => {

    res.status(200).json({requestQuery: req.query, requestNody: req.body});

};
exports.returnMoney = async (req, res) => {
    let requestBody_1 ={
        "sender":"rest",
        "ver":"1.0.0",
        "mid":"999812666555013",
        "tid":"T0000000",
        "pay_type":1,
        "tx_type":req.query.type,
        "params":
            {
                "amt":req.query.amt,

                "order_no":req.query.orderID
            }
    }
    let [, result_1] = await requestFun(requestBody_1, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/other.ashx");
    res.status(200).json({data: result_1});
}


exports.sendMoney = async (req, res) => {
    let requestBody_1 ={
        "sender":"rest",
        "ver":"1.0.0",
        "mid":"999812666555013",
        "tid":"T0000000",
        "pay_type":1,
        "tx_type":7,
        "params":
    {
        "order_no":req.query.orderID
    }
}
    let [, result_1] = await requestFun(requestBody_1, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/other.ashx");
    res.status(200).json({data: result_1});
}

exports.getCardRequest = async (req, res) => {
    try {
        let requestBody_1 =
            {
                "sender": "rest",
                "ver": "1.0.0",
                "mid": "999812666555013",
                "tid": "T0000000",
                "pay_type": 1,
                "tx_type": 1,
                "params":
                    {
                        "amt": req.query.amt,
                        "layout": "1",
                        "cur": "NTD",
                        "order_desc": "Testing",
                        "capt_flag": "0",
                        "order_no": req.query.orderID,
                        "result_flag": "0",
                        "post_back_url": "http://www.yubaopay.com.tw/cardReceive",
                        "result_url": "https://www.baidu.com",
                        "pan":"5408360100001705",
                        "exp_date":"3112",
                        "cvv2":"CVV2",

                    }
            };
        let [, result_1] = await requestFun(requestBody_1, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/auth.ashx");
        console.log(result_1)

        // let requestBody =
        //     {
        //         "sender": "rest",
        //         "ver": "1.0.0",
        //         "mid": "999812666555013",
        //         "tid": "T0000000",
        //         "pay_type": 1,
        //         "tx_type": 3,
        //         "params":
        //             {
        //                 "amt": "18900",
        //                 "order_no": "NO012345678"
        //             }
        //     };
        //
        // let [, result] = await requestFun(requestBody, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/other.ashx");
        // console.log(result)
        // let [, result2] = await requestFun({}, "get", result.params[`hpp_url`]);
        console.log(`__________________________________________________________`);

        // res.writeHead(200, {"Content-Type": "text/html"});//注意这里
        // res.write(result2);
        // res.end();
        //res.redirect(301, result.params[`hpp_url`]);
        res.status(200).json({data: result_1});
    } catch (err) {
        console.log(err)
        return res.status(503).json({error_msg: `503`, error_code: err.message});
    }
};
