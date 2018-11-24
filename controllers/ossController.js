let OSS = require('ali-oss');
let client = new OSS({
    accessKeyId: 'LTAI98iZQpjrZpDz',
    accessKeySecret: 'HWmBDNZKQ7vIaXIeSurwi5awUxPuFE',
    region: 'oss-cn-hongkong',
    bucket: 'yubaopay',
});


let deleteImg = async () => {
    try {
        let result = await client.delete('TEST/6196077095616.jpg');
        console.log(result);
    } catch (err) {
        console.log(err);
    }
};
deleteImg();