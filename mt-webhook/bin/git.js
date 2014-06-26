/**
 * Created by jiangcheng.wxd on 14-6-10.
 */
var os = require("os");
//var shell = require("shelljs");
var cp = require("child_process");
var gitteh = require("gitteh");
var path = require("path");
var fs = require("fs");

exports.gitClone = function (repoInfo) {
    var aGitRepo = path.resolve(__dirname,'../gitRepo') + '/' + repoInfo.repository.name;
    var updateCmd = 'git pull origin master';
    var cloneCmd = 'git clone ' + repoInfo.repository.url + ' ' + aGitRepo;

	var exCmd = cloneCmd;
	fs.existsSync(aGitRepo,function(){
		exCmd = updateCmd;
	});

    cp.exec(exCmd, function (err, sto, ste) {
        if (err) {
            console.log(err);
            return;
        }

	    var fileData = fs.readFileSync(aGitRepo + '/index.html',{
		    encoding: 'utf-8'
	    });

	    console.log(fileData);

	    //打开对应git repo
        gitteh.openRepository(aGitRepo, function (err, repo) {
            process.chdir(aGitRepo);

	        var diffCmd = 'git diff -name-status ' + repoInfo.before + '...' + repoInfo.after;
	        console.log(diffCmd);
	        cp.exec(diffCmd,{
		        timeout: 2000,
		        maxBuffer: 600* 1024
	        },function(err, stdout, stderr){
		        console.log('所有输出文件',stdout.toString().split('\n'));
	        })
        });
    });
}