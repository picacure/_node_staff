var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require('./node_modules/socket.io/').listen(server)
    ;

server.listen(8181);

io.configure(function () {
    io.set('log level', 0);
    io.set('transports', ['xhr-polling']);
});

app.get('/', function (req, res) {
});

var pcSocket,
    MSG_TYPE = {
        M_CONNECT_REQ:'M_CONNECT_REQ',
        M_CONNECT_RES:'M_CONNECT_RES',
        M_SHAKE_REQ:'M_SHAKE_REQ',
        M_SHAKE_RES:'M_SHAKE_RES',
        M_REPLAY:'M_REPLAY',

        PC_CONNECT_REQ:'PC_CONNECT_REQ',  //PC连接请求.
        PC_DATA_RES:'PC_DATA_RES',         //PC数据输出.

        PC_SHAKE_RES:'PC_SHAKE_RES',

        PC_REPLAY:'PC_REPLAY'  //重玩
    }
    ;

var MSocket = []
    ;

io.sockets.on('connection', function (socket) {

    //PC端接入.
    socket.on(MSG_TYPE.PC_CONNECT_REQ, function (data) {
        console.log(data);
        pcSocket = socket;
    });

    //M端接入.
    socket.on(MSG_TYPE.M_CONNECT_REQ, function (data) {
        console.log(data);
        MSocket.push(socket);
        if(pcSocket){
            pcSocket.emit(MSG_TYPE.PC_DATA_RES, data);
        }
    });

    //重玩.
    socket.on(MSG_TYPE.PC_REPLAY, function (data) {
        if(MSocket.length > 0){
            for(var i = 0,len = MSocket.length; i < len; i++){
                MSocket[i].emit(MSG_TYPE.M_REPLAY, data);
            }

            console.log(data);
            MSocket = [];
        }
    });

    //M端晃动数据.
    socket.on(MSG_TYPE.M_SHAKE_REQ, function (data) {

        if(pcSocket){
            pcSocket.emit(MSG_TYPE.PC_SHAKE_RES, data);
        }
    });
});

