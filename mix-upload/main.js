var express = require('express'),
    fs = require('fs'),
    app = express.createServer(),
    qs = require('querystring'),
    url = require('url')
    ;


//渲染执行模块
(function () {
    app.configure(function () {
        app.use(express.bodyParser());
        app.use(express.static('./static/'));
        app.use(app.router);
    });

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.set('view options', {
        layout: false
    });

    app.get('/', function (req, res) {
        var argu = qs.parse(url.parse(req.url).query);

        if (!!argu.type) {

            //渲染引擎
            if (argu.type == 1 && !!argu.title) {
                parseJSFile(libsSourceDir, argu.title);
                res.render('libsSource', codeResult);
            }


            // if(argu.type == 2 && !!argu.title){
            //     res.render('trans', {content:parseTrans(transDir + argu.title)});
            // }

        }
        else {
            res.render('index', {lib: libSource});
        }

    });


    app.listen(process.env.VMC_APP_PORT || 3000);
})();





