(function ($,window) {

    var MSG_TYPE = {
        M_CONNECT_REQ:'M_CONNECT_REQ',
        M_CONNECT_RES:'M_CONNECT_RES',
        M_SHAKE_REQ:'M_SHAKE_REQ',
        M_SHAKE_RES:'M_SHAKE_RES',
        M_REPLAY:'M_REPLAY',

        PC_CONNECT_REQ:'PC_CONNECT_REQ',
        PC_DATA_RES:'PC_DATA_RES',

        PC_SHAKE_RES:'PC_SHAKE_RES',

        PC_REPLAY:'PC_REPLAY'  //重玩
    };

    var CONST_VAR = {
        PORT: ':8181/'
    };

    var pc,  //PC页面
        mm   //Mobile页面
        ;


    var nextFrame = (function() {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { return setTimeout(callback, 17); }
    })();


    var myEvent = new EventEmitter(),
        whoWin = ''
        ;

    myEvent.addListener('Game-over', function(ID){
        for(var i = 0,len = pc.boatArr.length,boatID; i < len; i++){
            boatID = pc.boatArr[i].getID();
            if(ID == boatID){
                pc.boatArr.remove(i);

                //赢家.
                if(whoWin == ''){
                    whoWin = boatID;
                }
            }
        }

        //都到达终点刷新页面.
        if(pc.boatArr.length == 0){
            pc.getSocket().emit(MSG_TYPE.PC_REPLAY, { winID: whoWin });

            setTimeout(function(){
                window.location.reload();
            },2000);
        }
    });

    //河流是否到尽头，减少渲染.
    var isRiverOver = false;
    var BOAT = function(id){
        this.ID = id;

        //静态图片.
        this.$boatS = $('.' + id);

        //动态船.
        this.$boat = $('.' + id.toString().substr(0,id.toString().length - 1));

        //动力系数.
        this.power = 3;

        //河水.
        this.$river = $('.river');

        this.riverTrans = -1370;

        this.dist = 0;

        this.transWrapper = 2350;
    };
    BOAT.prototype = {
        constructor: BOAT,
        getID: function(){
            return this.ID;
        },
        nextFrame: function() {
            return window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function(callback) { return setTimeout(callback, 17); }
        },
        animate: function(){

            var _self = this
                ;

            _self.$boatS.hide();
            _self.$boat.show();
            _self.rock();
        },
        rock: function(){
            var _self = this
                ;



            var rockFrame = function(){
                _self.power -= 0.01;

                if(_self.power > 0){
                    //get translatex.
                    if(_self.$river.css('webkitTransform')){
                        _self.riverTrans = +_self.$river.css('webkitTransform').match(/-\d*\.*\d*/g);
                        _self.riverTrans += (_self.power/2);
                    }
                    _self.transWrapper -= _self.power;

                    //船移动.
                    if(_self.transWrapper > 0){
                        _self.$boat.css({
                            '-webkit-transform': 'translatex(' + _self.transWrapper + 'px)'
                        });
                    }
                    else{
                        _self.$boat.hide();
                        _self.$boatS.css({
                            '-webkit-transform': 'translatex(0px)'
                        }).show();

                        //二维码隐藏.
                        $('.mQrCode').hide();
                        //到达终点,发送消息
                        myEvent.emitEvent('Game-over',[_self.ID]);
                        return;
                    }


                    //河流移动.
                    if(_self.riverTrans < 0){
                        _self.$river.css({
                            '-webkit-transform': 'translatex(' + _self.riverTrans + 'px)'
                        });
                    }
                    else{
                        //河流到尽头.
                        isRiverOver = true;
                    }

                    //动画帧数.
                    nextFrame(rockFrame);
                }
                else{
                    _self.power = 0;

                    nextFrame(rockFrame);
                }
            }

            rockFrame();
        },
        pump: function(pumpArg){

            //摇动加油.
            var _self = this;
            _self.power += 1;

            //上线.
            if(_self.power > 20){
                _self.power = 20;
            }

        },
        reset: function(){

        }
    };


    var PC = function(){
        this.initSocket();
        this.listen();
        //生成二维码.
        this.generateQRCode();

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

            var _self = this;

            //连接，确定一个server socket.
            _self.socket.emit(MSG_TYPE.PC_CONNECT_REQ, {});

            //新的终端接入.
            _self.socket.on(MSG_TYPE.PC_DATA_RES, function (data) {
                var boat = new BOAT(data.ID);

                _self.boatArr.push(boat);
                //隐藏二维码，显示ID.


                //开始动画.
                boat.animate();
            });


            //晃动数据.
            _self.socket.on(MSG_TYPE.PC_SHAKE_RES, function(data){
                //分配动画数据.
                //$('.spray').text(data.shakeArg.ID + Date.now());

                for(var i = 0,len = _self.boatArr.length; i < len; i++){
                    if(_self.boatArr[i].getID() == data.shakeArg.ID){

                        //获得一次动力.
                        _self.boatArr[i].pump(data.shakeArg);

                        //获取数据，演示动画.
                        //_self.boatArr[i].animate(data.shakeArg);
                    }
                }
            });
        },
        getSocket: function(){
            return this.socket;
        },
        generateQRCode: function(){
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

            for (var i = 0, mUrl = '' , len = $mQrCode.length; i < len; i++) {
                mUrl = '';

                //生成className  ID
                mUrl += urlDir + '?id=' + $mQrCode.eq(i).parent()[0].className;
                qrCodeConfig.text = mUrl;
                new QRCode($mQrCode[i], qrCodeConfig);
            }

        }
    };



    var MOBILE =  function(id){
        this.ID = id;
        this.initSocket();
        this.listener();
        this.startShake();
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
            this.socket.emit(MSG_TYPE.M_CONNECT_REQ, {
                ID: _self.ID,
                UA: navigator.userAgent
            });

            //test.
            this.socket.on(MSG_TYPE.M_CONNECT_RES, function (data) {
                alert(data);
            });

            //重玩.
            this.socket.on(MSG_TYPE.M_REPLAY, function (data) {
                if(data.winID == _self.ID) {
                    $('.mID').html("恭喜，你赢啦！！！！<br>扫描二维码重玩");
                }
                else{
                    $('.mID').html("矮油，输咯～～～～<br>扫描二维码重玩");
                }

            });
        },
        startShake: function(){
            var _self = this,
                $console = $('.console')
                ;


            window.addEventListener('shake', function(e){

                //M端显示三个轴的信息.
//                $console.eq(0).text(e.deltaX);
//                $console.eq(1).text(e.deltaY);
//                $console.eq(2).text(e.deltaZ);

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
            this.socket.emit(MSG_TYPE.M_SHAKE_REQ, {shakeArg: obj});
        }
    };


    var Route =  {
        search: window.location.search.match(/id=(\w*)/) || '-1',
        router: function(){

            //PC页面
            if(Route.search == '-1'){
                pc = new PC();
            }
            //Mobile 页面.
            else{

                var result = tmpl(window.TMPL.mbody, { ID: Route.search[1]});
                $('#wrapper').html(result);

                mm = new MOBILE(Route.search[1]);
            };
        }
    };

    Route.router();


})(Zepto,window);