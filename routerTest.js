const express = require('express');

let app = express();
app.use(express.static('public'));
const DOMAIN = 'http://localhost:80';
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', DOMAIN);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        // Pass to next layer of middleware
        next();
    }
});
app.get('/ceshi', function (req, res) {
        return res.status(200).json({
            success: true,
            message: 'Server is running'
        });

});


app.listen(80);
console.log("Begin Server");
