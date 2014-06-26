/**
 * Created by jiangcheng.wxd on 14-6-10.
 */
var http = require('http');
var git = require('./bin/git');

var server = http.createServer(function (req, res) {

    var pushEventObj = {
        before: "",
        after: "",
        ref: "",
        user_id: 0,
        user_name: "",
        project_id: 0,
        repository: {
            name: "",  //app-qrbuy-plus
            url: "",  //git@gitlab.alibaba-inc.com:mtb/app-qrbuy-plus.git
            description: "",
            homepage: ""  //http://gitlab.alibaba-inc.com/mtb/app-qrbuy-plus
        },
        commits: [],
        total_commits_count: 0
    };

    function getKey(s, d) {
        d.before = s.before || '';
        d.after = s.after || '';
        d.ref = s.ref || '';
        d.user_name = s.user_name || '';
        d.repository = s.repository || undefined;

        if (!!s.repository) {
            d.repository.name = s.repository.name;
            d.repository.url = s.repository.url;
        }
    }

    req.on("data", function (chunk) {
        var cObj = JSON.parse(chunk);

        try{
            getKey(cObj, pushEventObj);
            git.gitClone(pushEventObj);
        }
        catch (e){
            console.log(e);
        }
    });
});
server.listen(8000);