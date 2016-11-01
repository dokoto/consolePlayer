
'use strict';

module.exports = function(grunt, options) {

    return {
        test: {
          files: [{
              expand: true,
              cwd: 'src/',
              src: ['index.html', 'manifest.json'],
              dest: 'builds/core/<%=args.mode%>/'
          }]
        },
        constants: {
            files: [{
                expand: true,
                cwd: __dirname + '/config/',
                src: ['constants.json'],
                dest: 'src/assets/config/'
            }],
            options: {
                process: function(content, srcpath) {
                    try {
                        const path = require('path');
                        let constsToModify = require(srcpath);
                        let builtConsts = {};
                        for (let key in constsToModify) {
                            if (options.args[key.toLowerCase()] !== undefined) {
                                builtConsts[key] = options.args[key.toLowerCase()];
                            } else {
                                builtConsts[key] = constsToModify[key];
                            }
                        }
                        return JSON.stringify(builtConsts);
                    } catch (error) {
                        grunt.log.error(error);
                        return content;
                    }
                }
            }
        }
    };
};
