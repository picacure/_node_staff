(function(){

    var baseLine = 30;

    //去除噪音数据
    var fit = {
        fitLine: function(data){
            if(Math.abs(data) < baseLine){
                return 0;
            }
            else{
                return data;
            }
        }
    };

    window.Fit = fit;
})();