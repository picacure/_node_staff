(function (window) {
    var $out = "";
    $out += '<div class="mbox">\r\n    <div class="txt">{%=o.ID%}</div>\r\n    <div class="mID"><img src="./images/wait.gif" alt=""></div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n</div>\r\n';

    window.TMPL = {};
    window.TMPL.mbody = $out;
})(window);
