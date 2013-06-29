(function () {

    var MSG_TYPE = {
        M_CONNECT_REQ:'M_CONNECT_REQ',
        M_CONNECT_RES:'M_CONNECT_RES',
        M_SHAKE_REQ:'M_SHAKE_REQ',
        M_SHAKE_RES:'M_SHAKE_RES',

        PC_CONNECT_REQ:'PC_CONNECT_REQ',
        PC_DATA_RES:'PC_DATA_RES',

        PC_SHAKE_RES:'PC_SHAKE_RES'
    };

    var CONST_VAR = {
        PORT: ':8181/'
    };

    var search = window.location.search.match(/\d{1,}/) || -1;

    if(search == -1){
        //生成二维码.
        generateQRCode();
        pcHandler();
    }
    else{
        mHandler(search);
    };

    var pcSocket;
    var myDraw;
    function pcHandler() {
        var serverUrl = window.location.origin + CONST_VAR.PORT
            ;
        pcSocket = io.connect(serverUrl);

        //连接，确定一个server socket.
        pcSocket.emit(MSG_TYPE.PC_CONNECT_REQ, {});

        //新的终端接入.
        pcSocket.on(MSG_TYPE.PC_DATA_RES, function (data) {
            txt_notification('','新机器接入',data.MobileUA.UA || '');
        });

        myDraw =  new Draw('myBoard',{});

        //晃动数据.
        pcSocket.on(MSG_TYPE.PC_SHAKE_RES, function(data){
            drawLine(data);
        });
    }


    function drawLine(data){
        myDraw.drawLine(data.Shake.shakeArg.deltaX,data.Shake.shakeArg.deltaY);
    }

    var mSocket;
    function mHandler(id) {
        var result = tmpl(window.TMPL.mbody, {ID:id});
        document.getElementById('wrapper').innerHTML = result;


        var serverUrl = window.location.origin + CONST_VAR.PORT;

        mSocket = io.connect(serverUrl);

        mSocket.emit(MSG_TYPE.M_CONNECT_REQ, { UA: navigator.userAgent });

        mSocket.on(MSG_TYPE.M_CONNECT_RES, function (data) {
            alert(data);
        });


//        for(var i = 0; i < 1000;i++){
//            mSocket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: {
//                deltaX: 6 + i*2 ,
//                deltaY: 8,
//                deltaZ: 10
//            }});
//        }

        shakeStart();
    }

    window.addEventListener('shake', function(e){

        document.getElementsByClassName('console')[0].innerText = e.deltaX;
        document.getElementsByClassName('console')[1].innerText = e.deltaY;
        document.getElementsByClassName('console')[2].innerText = e.deltaZ;
        emitShake(e);

    }, false);

    function emitShake(e){
        mSocket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: e});
    }


    var myShakeEvent;
    function shakeStart(){
        myShakeEvent = new window.Shake();
        myShakeEvent.start();

//        for(var i = 0; i < 1000;i++){
//            mSocket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: {
//                deltaX: 6 + i*2 ,
//                deltaY: 8,
//                deltaZ: 10
//            }});
//        }

    }


    function generateQRCode() {
        var urlDir = window.location.href;
        var mQrCode = document.getElementsByClassName('mQrCode');

        var qrCodeConfig = {
            text:"",
            width:150,
            height:150,
            colorDark:"#000000",
            colorLight:"#ffffff",
            correctLevel:QRCode.CorrectLevel.H
        }

        for (var i = 0, mUrl = ''; i < 3; i++) {
            mUrl = '';
            mUrl += urlDir + '?id=' + i;
            qrCodeConfig.text = mUrl;
            new QRCode(mQrCode[i], qrCodeConfig);
        }

    }

    function txt_notification(image, title, content){
        if (window.webkitNotifications.checkPermission() == 0) {
            return window.webkitNotifications.createNotification(image, title, content);
        }
        else{
            document.getElementById('consolePad').innerHTML = content;
        }
    }
})();