var fs = require('fs'),
    path = require('path'),
    js_beautify = require('./beautify')
    ;

var filter = '.html',
    filterFileDirArr = [],
    filterFileNameArr = [],
    outputDir = ''
    ;

//读取配置文件.
function readFromConfig(dir) {

    var args = process.argv.slice(1);

    var data,
        dirs,
        matchDir = '',
        stat,
        fileName = ''
        ;

    //judge if .tmplconf or other config file is existed.
    if (args[1]) {
        data = fs.readFileSync(path.resolve(dir, args[1]), 'utf-8')
    }
    else {
        data = fs.readFileSync(dir + '\\' + '.tmplConf', 'utf-8')
    }

    //find each case.
    dirs = data.split('\r\n');


    for (var i = 0; i < dirs.length; i++) {

        dirs[i] = dirs[i].trim();

        //替换所有目录的反斜杠.
        if (dirs[i].indexOf(filter) == -1) {
            dirs[i] = dirs[i].replace(/\//g, '\\');
        }

        if (dirs[i].indexOf('-outputs') > -1) {
            outputDir = path.resolve(dir, dirs[i].split(':')[1]);
        }
        else if (dirs[i] == '') {
            continue;
        }
        else {
            matchDir = path.resolve(dir, dirs[i]);

            if (!fs.existsSync(matchDir)) {
                console.log('请确认.joinConf文件中所有路径、文件配置正确!');
                console.log('不存在路径或文件:' + matchDir);

                return false;
            }
            else {

                stat = fs.statSync(matchDir);
                if (stat.isDirectory()) {
                    traverseDir(matchDir);
                }
                else if (stat.isFile()) {
                    filterFileDirArr.push(matchDir);
                    fileName = matchDir.substring(matchDir.lastIndexOf('//'), matchDir.length).match(/(\w*).html/)[1];
                    filterFileNameArr.push(fileName);
                }
                else {
                    return false;
                }
            }
        }
    }

    return true;
}


//遍历文件.
function traverseDir(dirOrFile) {
    var stat,
        files = fs.readdirSync(dirOrFile)
        ;

    for (var i = 0; i < files.length; i++) {
        stat = fs.statSync(dirOrFile + '\\' + files[i]);

        if (stat.isDirectory()) {
            return arguments.callee(dirOrFile + '\\' + files[i]);
        }
        else if (stat.isFile()) {

            if (filter == path.extname(files[i])) {
                filterFileDirArr.push(dirOrFile + '\\' + files[i]);
                filterFileNameArr.push(files[i]);
            }
        }
    }
}


//拼接文件.
function joinAll() {

    var dir = path.dirname(outputDir);

    //递归创建目录.
    (function mkdir(dir) {
        var dirname = path.dirname(dir)
            ;

        if (!fs.existsSync(dirname)) {
            mkdir(dirname);
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0755);
        }
        else {
            return;
        }
    })(dir);

    // 一个元素即一个文件。
    for (var i = 0; i < filterFileDirArr.length; i++) {
        //首次写，其他追加.
        if (i == 0) {
            fs.writeFileSync(outputDir, makeAnonymityFunc(0, filterFileNameArr[i], fs.readFileSync(filterFileDirArr[i], 'utf-8')) + '\r\n', 'utf8');
        }
        else {
            fs.appendFileSync(outputDir, makeAnonymityFunc(i, filterFileNameArr[i], fs.readFileSync(filterFileDirArr[i], 'utf-8')) + '\r\n', 'utf8');
        }
    }
}

function makeAnonymityFunc(time, filename, tmpl) {
    var str;

    if (time == 0) {
        str = [
            '(function(window){ ',
            'var $out = "";',
            html(tmpl),
            'window.TMPL = {};',
            'window.TMPL.' + filename + ' = $out;',
            '})(window);'
        ].join('\n');

    }
    else {
        str = [
            '(function(window){ ',
            'var $out = "";',
            html(tmpl),
            'window.TMPL.' + filename + ' = $out;',
            '})(window);'
        ].join('\n');
    }

    // 处理 HTML 语句
    function html(code) {
        var replaces = ["$out='';", "$out+=", ";", "$out"]
            ;

        // 记录行号
        //line += code.split(/\n/).length - 1;


        code = code
            // 单引号与反斜杠转义(因为编译后的函数默认使用单引号，因此双引号无需转义)
            .replace(/('|\\)/g, '\\$1')
            // 换行符转义(windows + linux)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');

        code = replaces[1] + "'" + code + "'" + replaces[2];

        return code + '\n';
    }

    var code;

    if (typeof js_beautify !== 'undefined') {

        js_beautify =
            typeof js_beautify === 'function'
                ? js_beautify
                : js_beautify.js_beautify;

        var config = {
            indent_size: 4,
            indent_char: ' ',
            preserve_newlines: true,
            braces_on_own_line: false,
            keep_array_indentation: false,
            space_after_anon_function: true
        };

        code = js_beautify(str, config);

    }

    return code;
}


function init(dirOrFile) {
    filterFileDirArr = [];
    filterFileNameArr = [];

    // string util.
    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }

    if (readFromConfig(dirOrFile)) {
        joinAll();
    }
}

module.exports = init;