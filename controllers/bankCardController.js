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

exports.getCardRequest = async (req, res) => {
    try {
        let requestBody =
            {
                "sender": "rest",
                "ver": "1.0.0",
                "mid": "999812666555013",
                "tid": "T0000000",
                "pay_type": 1,
                "tx_type": 3,
                "params":
                    {
                        "amt": "18900",
                        "order_no": "NO012345678"
                    }
            };
        let [, result] = await requestFun(requestBody, "POST", "https://tspg-t.taishinbank.com.tw/tspgapi/restapi/other.ashx");
        console.log(result)
        // let [, result2] = await requestFun({}, "get", result.params[`hpp_url`]);
        console.log(`__________________________________________________________`);

        // res.writeHead(200, {"Content-Type": "text/html"});//注意这里
        // res.write(result2);
        // res.end();
        //res.redirect(301, result.params[`hpp_url`]);
        res.status(200).json({data:result.params[`hpp_url`]});
    } catch (err) {
        console.log(err)
        return res.status(503).json({error_msg: `503`, error_code: err.message});
    }
};
