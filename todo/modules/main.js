(function (EJS, $) {

    var archives = $('#archive div');

    var list = $('.list');

    for(var i = 0,len = archives.length; i < len;i++){
        var dir = 'data/' + archives.eq(i).text();

        (function(date){
            $.get(dir,function(response){
                var data = response;
                data.date = date;
                var dom =  new EJS({url:'views/view.ejs'}).render(data);

                list.append(dom);
            });
        })(archives.eq(i).text());

    }

    $(document).on('click','.date',function(){
        $(this).parent().siblings().toggleClass('hide');
    });

})(EJS, Zepto);