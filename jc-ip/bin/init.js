#!/usr/bin/env node

var cp = require('child_process');

cp.exec('ifconfig', function(err, stdout, stderr) {
	if (stderr) {
		console.log(stderr);
	}
	else{

		var sPos = stdout.indexOf('en0');
		var ePos = stdout.indexOf('en1');
		var midStr = stdout.slice(sPos,ePos);

		var result  = (/inet\s+(.*)\s+netmask/g.exec(midStr));
		if(result.length > 1){
			cp.exec("echo " + result[1] + " | pbcopy",function(err,stdout,stderr){
				if(stderr){
					console.log(stderr);
				}
				else{
					console.log('Your Mac ip is ' + result[1]);
				}
			});
		}
	}
});