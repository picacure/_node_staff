可以根据指定的依赖关系将将JS文件简单的拼凑在一起

##将指定的JS文件进行物理拼接

##使用

1.在项目中新建.joinConf文件.

2.在.joinConf文件中依次列出需要拼接的JS的文件夹和JS文件名，该工具会依次拼接所有JS文件.

例如 .joinConf文件内容如下：

    js/
    init.js

    -outputs:kkkk.js

其中outputs为输出拼接的相对路径和文件名.