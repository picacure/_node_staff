/*
 * grunt-mt
 * https://github.com/picacure/_node_staff
 *
 * Copyright (c) 2014 jiangcheng.wxd
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    var http = require('http');
    var fs = require("fs");

    var reOpt = {
        hostname: 'localhost',
        port: 8000,
        path: '/',
        method: 'POST'
    };

    grunt.registerMultiTask('mt', 'submit special file to target interface', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        });

        console.log('s');

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            // Concat specified files.
            var src = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Read file source.
                return grunt.file.read(filepath);
            }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            src += options.punctuation;

            // Write the destination file.
            grunt.file.write(f.dest, src);

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');


//            var req = http.request(reOpt, function(res) {
//                res.setEncoding('utf8');
//            });
//
//            var fileData = fs.readFileSync(__dirname + '/index.html',{
//                encoding: 'utf-8'
//            });
//
//            console.log('s');
//
//            req.write(fileData);
//            req.end();
        });
    });

};
