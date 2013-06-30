(function (window) {
    var $out = "";
    $out += '<div class="mbox">\r\n    <div class="txt">你的ID</div>\r\n    <div class="mID">{%= o.ID%}</div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n    <div class="console"></div>\r\n</div>\r\n';

    window.TMPL = {};
    window.TMPL.mbody = $out;
})(window);
