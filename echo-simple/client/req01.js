/**
 * Created by jiangcheng.wxd on 14-6-5.
 */
var http = require('http');
var fs = require("fs");

var options = {
    hostname: 'localhost',
    port: 8000,
    path: '/',
    method: 'POST'
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
});

// write data to request body

var fileData = fs.readFileSync(__dirname + '/index.html',{
    encoding: 'utf-8'
});

req.write(fileData);
req.end();