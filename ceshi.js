var express = require('express');

// This line is from the Node.js HTTPS documentation.

const https = require("https"),
    fs = require("fs");

const options = {
    cert: fs.readFileSync('./keys/d4bfdc557afb919a.crt'),
    ca:fs.readFileSync('./keys/gd_bundle-g2-g1.crt'),
    key: fs.readFileSync('./keys/asd.pem')
};

const app = express();

app.use((req, res) => {
    res.writeHead(200);
    res.end("hello world\n");
});

https.createServer(options, app).listen(8080);