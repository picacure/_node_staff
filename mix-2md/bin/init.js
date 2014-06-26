#!/usr/bin/env node

var fs = require('fs'),
    ejs = require('ejs'),
    path = require('path'),
    istream,
    args,
    ofilename,
    tmplStr
    ;

tmplStr = fs.readFileSync(__dirname + '/tmpl.ejs', 'utf-8');

args = process.argv.slice(1);

ofilename = path.basename(args[1].toString(), '.json');
ofilename += '.md';

istream = fs.createReadStream(path.basename(args[1].toString()), {flags: 'r', encoding: 'utf-8'});


istream.on('data', function (chunk) {
    try {
        var jsonData = JSON.parse(chunk);
    }
    catch (e) {
        console.log('请检查json数据格式～～');
    }

    fs.writeFileSync(ofilename, ejs.render(tmplStr, jsonData), 'utf-8');
});
istream.on('end', function (item) {
});