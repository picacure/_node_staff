var fs = require('fs'),
	path = require('path')
	;

var filter = '.js',
	filterArr = [],
	outputDir = ''
	;

//读取配置文件.
function readFromConfig(dir){
	var data = fs.readFileSync(dir + '\\' + '.joinConf','utf-8'),
		dirs = data.split('\r\n'),
		matchDir = '',
		stat	
		;


	for(var i = 0; i < dirs.length; i++){

		dirs[i] = dirs[i].trim();

		//替换所有目录的反斜杠.
		if(dirs[i].indexOf(filter) == -1){
			dirs[i] = dirs[i].replace(/\//g,'\\');

			
		}
		

		if(dirs[i].indexOf('-outputs') > -1){
			outputDir = path.resolve(dir,dirs[i].split(':')[1]);
		}
		else if(dirs[i] == ''){
			continue;
		}
		else{
			matchDir = path.resolve(dir,dirs[i]);

			if(!fs.existsSync(matchDir)){
				console.log('请确认.joinConf文件中所有路径、文件配置正确!');
				console.log('不存在路径或文件:' + matchDir);

				return false;				
			}
			else{

				stat = fs.statSync(matchDir);
				if(stat.isDirectory()){
					traverseDir(matchDir);	
				}
				else if(stat.isFile()){
					filterArr.push(matchDir);	
				}
				else{
					return false;
				}
			}
		}
	}

	return true;	
}


//遍历文件.
function traverseDir (dirOrFile) {
	var stat,
		files = fs.readdirSync(dirOrFile)
		;

	for(var i = 0; i < files.length; i++){
		stat = fs.statSync(dirOrFile + '\\' + files[i]);

		if(stat.isDirectory()){
			return arguments.callee(dirOrFile + '\\' + files[i]);
		}	
		else if(stat.isFile()){

			if(filter == path.extname(files[i])){
				filterArr.push(dirOrFile + '\\' + files[i]);
			}
		}				
	}
}


//拼接文件.
function joinAll(){

	var dir = path.dirname(outputDir);

	//递归创建目录.
	(function mkdir(dir){
		var dirname = path.dirname(dir),
			stat
			;
			
		if(!fs.existsSync(dirname)){
			mkdir(dirname);	
		}
		
		if(!fs.existsSync(dir)){
			fs.mkdirSync(dir,0755);
		}
		else{
			return;
		}
	})(dir);

	for(var i = 0; i < filterArr.length; i++){
		//首次写，其他追加.
		if(i == 0){
			fs.writeFileSync(outputDir,fs.readFileSync(filterArr[i], 'utf-8') + '\r\n;','utf8');		
		}
		else{
			fs.appendFileSync(outputDir,fs.readFileSync(filterArr[i], 'utf-8') + '\r\n;','utf8');		
		}
	}
}


function init(dirOrFile){
	filterArr = [];
	if(readFromConfig(dirOrFile)){
		joinAll();		
	}
}

module.exports = init;