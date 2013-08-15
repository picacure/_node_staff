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
        this.initSocket();
        this.listen();

        this.canvas = new Curve();

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

            //设定Token.
            tokenArr.push('H5');
            tokenArr.push('IOS');

            //连接，确定一个server socket.
            _self.socket.emit(FRM_MSG.PC_CONNECT_REQ, { Token: tokenArr });

            //新的终端接入.
            _self.socket.on(FRM_MSG.PC_M_CONNECT_RES, function (data) {
                $('.tip').text(data.ID + '成功接入,开始LV吧');
            });

            //摇晃数据.
            _self.socket.on(CUSTOMER_MSG.PC_SHAKE_RES, function (data) {

                if(data.shakeArg.ID == 'H5'){
                    _self.canvas.grow();
                }
                else if(data.shakeArg.ID == 'IOS'){
                    _self.canvas.grow(2);
                }
                else{
                    throw {
                        error: 'PC listen'
                    }
                }

            });
        },
        getSocket: function(){
            return this.socket;
        }
    };



    var MOBILE =  function(id,token){
        this.ID = id;
        this.Token = token || '';
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
                $('.mID').html('Token 失效');
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

//            if(_self.ID == 'H5'){
//                window.addEventListener('shake', function(e){
//
//                    _self.emitShake({
//                        ID: _self.ID,
//                        deltaX: e.deltaX,
//                        deltaY: e.deltaY,
//                        deltaZ: e.deltaZ
//                    });
//
//                }, false);
//
//                _self.shake = new window.Shake();
//                _self.shake.start();
//            }
//            else if(_self.ID == 'IOS'){
//
//                //alert(window.api.motion);
//                window.WindVane.api.motion.onShake(function(){
//                    _self.emitShake({
//                        ID: _self.ID,
//                        deltaX: 0,
//                        deltaY: 0,
//                        deltaZ: 0
//                    });
//                });
//            }
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
        IOS: window.location.search.match(/ios=(\w*)/) || '-1',   //ID
        H5: window.location.search.match(/h5=(\w*)/) || '-1',    //Token
        UriHelper: function parseURL(url) {
            var a =  document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':',''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function(){
                    var ret = {},
                        seg = a.search.replace(/^\?/,'').split('&'),
                        len = seg.length, i = 0, s;
                    for (;i<len;i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
                hash: a.hash.replace('#',''),
                path: a.pathname.replace(/^([^\/])/,'/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
                segments: a.pathname.replace(/^\//,'').split('/')
            };
        },
        router: function(){

            var params = Object.keys(Route.UriHelper(window.location.href).params);

            //PC页面
            if(!params.contains('ios') && !params.contains('h5')){
                pc = new PC();
            }
            //IOS.
            else if(params.contains('ios')){

                var result = tmpl(window.TMPL.mbody, { ID: 'IOS'});
                $('#wrapper').html(result);

                mm = new MOBILE('IOS','IOS');
            }
            else if(params.contains('h5')){
                var result = tmpl(window.TMPL.mbody, { ID: 'H5'});
                $('#wrapper').html(result);

                mm = new MOBILE('H5','H5');
            }
        }
    };

    Route.router();


})(Zepto,window);