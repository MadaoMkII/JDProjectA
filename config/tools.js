const crypto = require('crypto');

let isEmpty = (obj) => {
    if (obj == null) return true;
    if (obj.constructor.name === "Array" || obj.constructor.name === "String") return obj.length === 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && isEmpty(obj[key])) return true;
    }
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
//加密
exports.encrypt = (str) => {
    let cipher = crypto.createCipher('aes192', "tempSecretKey");
    let enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

//解密
exports.decrypt = (str) => {
    let decipher = crypto.createDecipher('aes192', "tempSecretKey");
    let dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};
exports.isEmpty = isEmpty;