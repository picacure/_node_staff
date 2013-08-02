(function ($,window) {

    //框架基本消息.
    var FRM_MSG = {
        M_CONNECT_REQ:'M_CONNECT_REQ',
        M_CONNECT_RES:'M_CONNECT_RES',

        M_TOKEN_INVALID:'M_TOKEN_INVALID',
        M_TOKEN_OK:'M_TOKEN_OK',

        PC_CONNECT_REQ:'PC_CONNECT_REQ',
        PC_M_CONNECT_RES:'PC_M_CONNECT_RES'
    };

    var CUSTOMER_MSG = {
        M_SHAKE_INIT:'M_SHAKE_INIT',     //PC通知M端开始摇晃.
        M_SHAKE_REQ:'M_SHAKE_REQ',
        M_SHAKE_RES:'M_SHAKE_RES',

        PC_SHAKE_RES:'PC_SHAKE_RES'
    };

    var GAME_MSG = {
        GAME_OVER: 'GAME_OVER'
    };

    var CONST_VAR = {
        PORT: ':8181/'
    };

    var pc,  //PC页面
        mm   //Mobile页面
        ;


    var myEvent = new EventEmitter()
        ;

    myEvent.addListener(GAME_MSG.GAME_OVER, function(ID){

    });

    //Todo:页面上的运动对象，如船，Canvas.


    var PC = function(){

        //生成二维码.
        this.generateQRCode();
        this.initSocket();
        this.listen();

        this.boatArr = [];
    };
    PC.prototype = {
        constructor: PC,
        initSocket: function(){
            var serverUrl = window.location.origin + CONST_VAR.PORT
                ;
            this.socket = io.connect(serverUrl);
        },
        listen: function(){

            var _self = this,
                tokenArr = [],
                $mQrCode = $('.mQrCode')
                ;

            for(var i = 0, len = $mQrCode.length; i < len; i++){
                tokenArr.push($mQrCode.eq(i).attr('data-token'));
            }

            //连接，确定一个server socket.
            _self.socket.emit(FRM_MSG.PC_CONNECT_REQ, { Token: tokenArr });

            //新的终端接入.
            _self.socket.on(FRM_MSG.PC_M_CONNECT_RES, function (data) {
                alert(data);
            });

            //摇晃数据.
            _self.socket.on(CUSTOMER_MSG.PC_SHAKE_RES, function (data) {
                alert(data.shakeArg.ID);
            });
        },
        getSocket: function(){
            return this.socket;
        },
        generateQRCode: function(el){
            var urlDir = window.location.href;
            var $mQrCode = $('.mQrCode');

            var qrCodeConfig = {
                text:"",
                width:150,
                height:150,
                colorDark:"#000000",
                colorLight:"#ffffff",
                correctLevel:QRCode.CorrectLevel.H
            }

            //全部渲染.
            var mUrl = '',
                tToken
                ;
            if(!el){
                for (var i = 0, len = $mQrCode.length; i < len; i++) {
                    mUrl = '';
                    tToken = Date.now();

                    //生成className  ID  、token
                    mUrl += urlDir + '?id=' + $mQrCode.eq(i).attr('data-for') + '&token=' + tToken;

                    //记录Token串.
                    $mQrCode.eq(i).attr('data-token',tToken);

                    qrCodeConfig.text = mUrl;
                    new QRCode($mQrCode[i], qrCodeConfig);
                }
            }
            else{
                tToken = Date.now();

                //生成className  ID  、token
                mUrl += urlDir + '?id=' + $mQrCode.eq(i).parent()[0].className + '&token=' + tToken;

                //记录Token串.
                $(el).attr('data-token',tToken);

                qrCodeConfig.text = mUrl;
                new QRCode(el, qrCodeConfig);
            }
        }
    };



    var MOBILE =  function(id,token){
        this.ID = id;
        this.Token = token;
        this.initSocket();
        this.listener();
    };

    MOBILE.prototype = {
        constructor: MOBILE,
        initSocket: function(){
            var serverUrl = window.location.origin + CONST_VAR.PORT;

            this.socket = io.connect(serverUrl);
        },
        listener: function(){
            var _self = this
                ;

            //连接，接入.
            this.socket.emit(FRM_MSG.M_CONNECT_REQ, {
                ID: _self.ID,
                UA: navigator.userAgent,
                Token: _self.Token
            });

            //Token 失效.
            this.socket.on(FRM_MSG.M_TOKEN_INVALID, function (data) {
                $('.mID').html('Token 失效<br>请重新扫描二维码');
            });

            //正常接入.
            this.socket.on(FRM_MSG.M_TOKEN_OK, function (data) {
                $('.mID').html('成功接入');

                _self.startShake();
            });

            //所有终端都已接入.
            this.socket.on(CUSTOMER_MSG.M_SHAKE_INIT, function (data) {

            });

        },
        startShake: function(){
            var _self = this
                ;

            window.addEventListener('shake', function(e){

                _self.emitShake({
                    ID: _self.ID,
                    deltaX: e.deltaX,
                    deltaY: e.deltaY,
                    deltaZ: e.deltaZ
                });

            }, false);

            _self.shake = new window.Shake();
            _self.shake.start();
        },
        emitShake: function(obj){
            this.socket.emit(CUSTOMER_MSG.M_SHAKE_REQ, {shakeArg: obj});
        }
    };


    var Route =  {
        search: window.location.search.match(/id=(\w*)/) || '-1',   //ID
        token: window.location.search.match(/token=(\w*)/) || '-1',    //Token
        router: function(){

            //PC页面
            if(Route.search == '-1'){
                pc = new PC();
            }
            //Mobile 页面.
            else{

                var result = tmpl(window.TMPL.mbody, { ID: Route.search[1]});
                $('#wrapper').html(result);

                mm = new MOBILE(Route.search[1],Route.token[1]);
            };
        }
    };

    Route.router();


})(Zepto,window);