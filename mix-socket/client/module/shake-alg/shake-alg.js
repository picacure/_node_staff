(function () {

    var baseLine = 30;

    //去除噪音数据
    var fit = {
        fitLine: function (data) {
            if (Math.abs(data) < baseLine) {
                return 0;
            }
            else {
                return data;
            }
        },
        smoothing: function (points, yBase) {
            var EPSILON = 10;

            console.log(points.length);

            for (var i = 0, len = points.length; i < len; i++) {
                if (Math.abs(points[i].y - yBase) < EPSILON) {
                    points[i].y = yBase;
                }
            }
            return points;
        }
    };

    window.Fit = fit;
})();