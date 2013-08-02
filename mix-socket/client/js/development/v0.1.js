(function ($) {

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

    var swc = false;

    //PC页面
    if(search == -1){
        //生成二维码.
        generateQRCode();
        pcHandler();
    }
    //Mobile 页面.
    else{
        mHandler(search);
    };

    var pcSocket;
    var xDraw,
        xFitDraw,
        yDraw,
        zDraw,
        absXYZDraw,
        hAxis,
        vBase = 80
        ;
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

        //X轴线
        xDraw =  new Draw('xBoard',{ color : 'red', height: 200, width: '100%' });

        //x轴线滤波.
        xFitDraw = new Draw('xFitBoard',{ color : 'red', height: 200, width: '100%' });

        //Y轴线
        yDraw =  new Draw('yBoard',{ color : 'green', height: 200, width: '100%' });

        //Z轴线
        zDraw =  new Draw('zBoard',{ color : 'blue', height: 200, width: '100%' });

        //三轴加速度差分绝对值之和
        absXYZDraw =  new Draw('absXYZ',{ color : 'red', height: 200, width: '100%' });
        hAxis = 0;

        //晃动数据.
        pcSocket.on(MSG_TYPE.PC_SHAKE_RES, function(data){
            drawLine(data);
        });
    }

    var step = 3;
    function drawLine(data){
        //开始、暂停.
        if(!swc){
            document.getElementById('axisPad').innerHTML = 'X:' + data.Shake.shakeArg.deltaX +
                '<br>Y:' + data.Shake.shakeArg.deltaY +
                '<br>Z:' + data.Shake.shakeArg.deltaZ;



            xDraw.drawLine(hAxis,data.Shake.shakeArg.deltaX + vBase);
            xFitDraw.drawLine(hAxis,Fit.fitLine(data.Shake.shakeArg.deltaX) + vBase);
            yDraw.drawLine(hAxis,data.Shake.shakeArg.deltaY + vBase);
            zDraw.drawLine(hAxis,data.Shake.shakeArg.deltaZ + vBase);
            absXYZDraw.drawLine(hAxis,data.Shake.shakeArg.absXYZ + vBase);

            hAxis += step;
            if(hAxis > xDraw.size().width){
                hAxis = (hAxis % xDraw.size().width);
                xDraw.reset();
                xFitDraw.reset();
                yDraw.reset();
                zDraw.reset();
                absXYZDraw.reset();
            }
        }

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

        shakeStart();
    }

    function emitShake(obj){
        mSocket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: obj});
    }

    var myShakeEvent;
    function shakeStart(){
        window.addEventListener('shake', function(e){

            document.getElementsByClassName('console')[0].innerText = e.deltaX;
            document.getElementsByClassName('console')[1].innerText = e.deltaY;
            document.getElementsByClassName('console')[2].innerText = e.deltaZ;
            emitShake({
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
                absXYZ: e.absXYZ
            });

        }, false);
        myShakeEvent = new window.Shake();
        myShakeEvent.start();

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

        for (var i = 0, mUrl = '' ,len = $('.mQrCode').length; i < len; i++) {
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


    //暂停.
    $('.ctrBtn').on('click',function(e){
        swc = swc ? false: true;

        if(swc){
            $(this).text('开始');
        }
        else{
            $(this).text('暂停');
        }

    });

    $('figure').on('click',function(e){
        var $canvas = $(this).siblings('canvas');
        if($canvas.css('display').indexOf('none') > -1){
            $(this).children('.boardCtl').text('-');
            $canvas.show();
        }
        else{
            $(this).children('.boardCtl').text('+');
            $canvas.hide();
        }
    });

})(Zepto);