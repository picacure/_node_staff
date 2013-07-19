#!/usr/bin/env node


var join = require('../main')
					;

/*process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});*/

if(process.argv.length >= 3){
    if(process.argv[2].match(/.*\.joinConf/).length > 0){
        join(process.cwd(),process.argv[2]);     
    }
    else{
        console.log('please use like this: mix-join  ***.joinConf ');
    } 
}
else{
    console.log('please use like this: mix-join  ***.joinConf ');
}




