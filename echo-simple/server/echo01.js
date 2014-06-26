/**
 * Created by jiangcheng.wxd on 14-6-5.
 */
var http = require('http')
var server = http.createServer(function (req, res) {

    req.on("data",function(chunk){
        console.log('chunk' + chunk);
    });
});
server.listen(8000);