var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require('./node_modules/socket.io/').listen(server)
    ;

server.listen(8181);

console.log(__dirname);

app.get('/', function (req, res) {
    //res.sendfile(__dirname + 'index.html');
});

var pcSocket,
    mSocket,
    MSG_TYPE = {
        M_CONNECT_REQ:'M_CONNECT_REQ',
        M_CONNECT_RES:'M_CONNECT_RES',
        M_SHAKE_REQ:'M_SHAKE_REQ',
        M_SHAKE_RES:'M_SHAKE_RES',

        PC_CONNECT_REQ:'PC_CONNECT_REQ',  //PC连接请求.
        PC_DATA_RES:'PC_DATA_RES',         //PC数据输出.

        PC_SHAKE_RES:'PC_SHAKE_RES'
    }
    ;

io.sockets.on('connection', function (socket) {

    socket.on(MSG_TYPE.PC_CONNECT_REQ, function (data) {
        pcSocket = socket;
    });

    socket.on(MSG_TYPE.M_CONNECT_REQ, function (data) {
        mSocket = socket;
        if(pcSocket){
            pcSocket.emit(MSG_TYPE.PC_DATA_RES, { MobileUA: data });
        }

        mSocket.on(MSG_TYPE.M_SHAKE_REQ, function (data) {

            if(pcSocket){
                pcSocket.emit(MSG_TYPE.PC_SHAKE_RES, { Shake: data });
            }
        });
    });
});

