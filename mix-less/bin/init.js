#!/usr/bin/env node


var exec = require('child_process').exec,
    fs = require('fs')
	;

var less;

if(process.argv.length >= 3){
    var stat = fs.statSync(process.argv[2]);
    
    if(stat.isDirectory()){
        var dir = fs.readdirSync(process.argv[2]);
        var fileNameArr;
        var fileName;

        for(var i = 0,len = dir.length; i < len; i++){
            fileNameArr  = dir[i].match(/(.*)\.less/) || [];

            if(fileNameArr.length > 0){
                fileName = fileNameArr[fileNameArr.length - 1];    

                less = exec('lessc ' + process.argv[2] + '\\' + dir[i] + ' ' + process.argv[2] + '\\' + fileName + '.css',[]);

                console.log('lessc file ' + dir[i]);        
            }
               
        }
    }
    else if(stat.isFile()){

        var fileNameArr = process.argv[2].match(/(.*)\.less/) || [];

        if(fileNameArr.length > 0){
            var fileName = fileNameArr[fileNameArr.length - 1];
            less = exec('lessc ' + process.argv[2] + ' ' + fileName + '.css',[]);

            console.log('lessc file ' + process.argv[2]);
        }

    }
}
else{
    console.log('arguments length < 3');
}
