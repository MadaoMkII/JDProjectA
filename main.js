const http = require("http");

http.createServer((req, res) => {

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(JSON.stringify({username:"wahhh"}));
}).listen(3389);

console.log("Node js is 跑")

