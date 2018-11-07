const AlipaySdk = require('alipay-sdk').default;
let qr = require('qr-image');
let fs = require('fs');


let abc = async () => {
    try {

        const alipaySdk = new AlipaySdk({
            appId: "2018102961952197",
            privateKey: fs.readFileSync('./keys/应用私钥2048.txt', 'ascii'),
            alipayPublicKey: fs.readFileSync('./keys/应用公钥2048.txt', 'ascii'),
            camelcase: true,
            format: `JSON`,
            charset: `utf-8`,
            sign_type: "RSA2",
            gateway: `https://openapi.alipay.com/gateway.do`
        });
        const result = await alipaySdk.exec('alipay.user.info.auth', {
            // sdk 会自动把 bizContent 参数转换为字符串，不需要自己调用 JSON.stringify

                scopes: "auth_base",
                state: "dGhpcyBpcyBhIGV4YW1wbGU="

        });

        console.log(result)
    } catch (e) {
        console.log(e)
    }


}

abc();