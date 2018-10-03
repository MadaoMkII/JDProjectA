var uuid = require('node-uuid');
var sprintf = require("sprintf-js").sprintf;
var mongoClient = require('mongodb').MongoClient;
var host1 = "demotest-1.mongodb.tbc3.newtest.rdstest.aliyun-inc.com";
var port1 = 27017;
var host2 = "demotest-2.mongodb.tbc3.newtest.rdstest.aliyun-inc.com";
var port2 = 27017;
var username = "demouser";
var password = "123456";
var replSetName = "mgset-1441984991";
var demoDb = "test";
var demoColl = "testColl";
// 官方建议使用的方案
var url = sprintf("mongodb://%s:%d,%s:%d/%s?replicaSet=%s", host1, port1, host2, port2, demoDb, replSetName);
console.info("url:", url);
//获取mongoClient
mongoClient.connect(url, function(err, db) {
    if(err) {
        console.error("connect err:", err);
        return 1;
    }
//授权. 这里的username基于admin数据库授权
    var adminDb = db.admin();
    adminDb.authenticate(username, password, function(err, result) {
        if(err) {
            console.error("authenticate err:", err);
            return 1;
        }
//取得Collecton句柄
        var collection = db.collection(demoColl);
        var demoName = "NODE:" + uuid.v1();
        var doc = {"DEMO": demoName, "MESG": "Hello AliCoudDB For MongoDB"};
        console.info("ready insert document: ", doc);
// 插入数据
        collection.insertOne(doc, function(err, data) {
            if(err) {
                console.error("insert err:", err);
                return 1;
            }
            console.info("insert result:", data["result"]);
            // 读取数据
            var filter = {"DEMO": demoName};
            collection.find(filter).toArray(function(err, items) {
                if(err) {
                    console.error("find err:", err);
                    return 1;
                }
                console.info("find document: ", items);
//关闭Client，释放资源
                db.close();
            });
        });
    });
});