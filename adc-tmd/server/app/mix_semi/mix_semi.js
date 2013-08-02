var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require('../../node_modules/socket.io').listen(server),
    MSG_TYPE = require('./msg')
    ;

require('../../module/util/util');

server.listen(8181);


io.configure(function () {
    io.set('log level', 0);
    io.set('transports', ['websocket','xhr-polling','jsonp-polling','htmlfile']);
    /*
     io.set('transports', ['websocket',
     'xhr-polling',
     'htmlfile',
     'jsonp-polling',
     'flashsocket']);
     */
});

app.get('/', function (req, res) {

});



var pcSocket,
    MSocket = [],
    TokenArr = []
    ;

io.sockets.on('connection', function (socket) {

    //PC端接入.
    socket.on(MSG_TYPE.PC_CONNECT_REQ, function (data) {
        console.log('PC端接入');
        TokenArr = data.Token;
        pcSocket = socket;
    });

    //M端接入.
    socket.on(MSG_TYPE.M_CONNECT_REQ, function (data) {
        console.log('M端接入');
        //确认token串.
        if(TokenArr.contains(data.Token)){
            MSocket.push(socket);
            socket.emit(MSG_TYPE.M_TOKEN_OK, {});

            TokenArr.remByVal(data.Token);

            if(pcSocket){
                //部分接入.
                pcSocket.emit(MSG_TYPE.PC_M_CONNECT_RES, data);

                //全部接入.
                if(TokenArr.length == 0){
                    console.log('全部接入');
                    pcSocket.emit(MSG_TYPE.PC_M_ALL_CONNECT_RES, data);
                }

                console.log(TokenArr.length);
            }
        }
        //失效Token.
        else{
            socket.emit(MSG_TYPE.M_TOKEN_INVALID, {});
        }
    });

    //发送消息给所有M端，开始摇晃.
    socket.on(MSG_TYPE.PC_M_SHAKE_START_TIP, function (data) {
        console.log('发送消息给所有M端，开始摇晃');
        if(MSocket.length > 0){
            for(var i = 0,len = MSocket.length; i < len; i++){
                MSocket[i].emit(MSG_TYPE.M_SHAKE_INIT, {});
            }
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
        console.log(socket);
        if(pcSocket){
            pcSocket.emit(MSG_TYPE.PC_SHAKE_RES, data);
        }
    });
});

