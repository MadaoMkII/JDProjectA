const crypto = require('crypto');
const config = require('../config/develop');


let isEmpty = (obj) => {
    if (obj === "") return true;
    if (obj === {}) return true;
    if (obj === []) return true;
    if (obj === null) return true;
    if (obj === undefined) return true;
    if (obj.constructor.name === "Array" || obj.constructor.name === "String") return obj.length === 0;
    // for (let key in obj) {
    //     if (obj.hasOwnProperty(key) && isEmpty(obj[key])) return true;
    // }
    return false;
};

exports.compare = (pro) => {

    return function (obj1, obj2) {
        let val1 = obj1[pro];
        let val2 = obj2[pro];
        if (val1 < val2) { //正序
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
};


const ALGORITHM = 'AES-256-CBC'; // CBC because CTR isn't possible with the current version of the Node.JS crypto library
const HMAC_ALGORITHM = 'SHA256';
const KEY = config.KEY; // This key should be stored in an environment variable
const HMAC_KEY = config.HMAC_KEY; // This key should be stored in an environment variable
//加密
exports.encrypt = (plain_text) => {
    plain_text=plain_text+``;
    let IV = new Buffer(crypto.randomBytes(16)); // ensure that the IV (initialization vector) is random
    let cipher_text;
    let hmac;
    let encryptor;

    encryptor = crypto.createCipheriv(ALGORITHM, KEY, IV);
    encryptor.setEncoding('hex');
    encryptor.write(plain_text);
    encryptor.end();

    cipher_text = encryptor.read();

    hmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex')); // ensure that both the IV and the cipher-text is protected by the HMAC

    // The IV isn't a secret so it can be stored along side everything else
    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex')

};
//解密
exports.decrypt = function (cipher_text) {
    let cipher_blob = cipher_text.split("$");
    let ct = cipher_blob[0];
    let IV = new Buffer(cipher_blob[1], 'hex');
    let hmac = cipher_blob[2];
    let decryptor;

    let chmac = crypto.createHmac(HMAC_ALGORITHM, HMAC_KEY);
    chmac.update(ct);
    chmac.update(IV.toString('hex'));

    if (!constant_time_compare(chmac.digest('hex'), hmac)) {
        console.log("Encrypted Blob has been tampered with...");
        return null;
    }

    decryptor = crypto.createDecipheriv(ALGORITHM, KEY, IV);
    let decryptedText = decryptor.update(ct, 'hex');
    return decryptedText + decryptor.final('utf-8');


};

let constant_time_compare = function (val1, val2) {
    let sentinel=``;

    if (val1.length !== val2.length) {
        return false;
    }


    for (let i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }

    return sentinel === 0
};


exports.isEmpty = isEmpty;