//画图组件. by jiangC
(function(){
    var draw = function(domId,options){
        var myCanvas = document.createElement('canvas'),
            wrapper = document.getElementById(domId)
            ;

        myCanvas.style.width = getComputedStyle(wrapper,'width');
        myCanvas.style.height = getComputedStyle(wrapper,'height');

        this.canvas = myCanvas;
        this.context = this.canvas.getContext('2d');
        this.line = [
            {
                x:0,
                y:0
            }
        ]

        wrapper.appendChild(myCanvas);
    };

    draw.prototype.drawLine = function(xV,yV){
        var len = this.line.length - 1;

        this.context.moveTo(this.line[len].x, this.line[len].y);
        this.context.lineTo(xV, yV);
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'red';
        this.context.stroke();

        this.line.push({
            x:xV,
            y:yV
        })
    };

    draw.prototype.reset = function(){
        this.line = [
            {
                x:0,
                y:0
            }
        ]
    }

    window.Draw = draw;
})();