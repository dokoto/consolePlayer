'use strict';

module.exports = {
    jshint: {
        options: {
            node: true,
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: false,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            boss: true,
            eqnull: true,
            esversion: 6,
            globalstrict: true,
            globals: {
                require: true,
                define: true,
                location: true,
                document: true,
                requirejs: true,
                navigator: true,
                window: true,
                console: true,
                module: true,
                APP: true,
                $: true,
                jQuery: true,
                i18n: true,
                btoa: true
            }
        },
        gruntfile: {
            src: 'gruntfile.js'
        },
        files: {
            src: ['./src/js/**/*.js', '!./components/**/*.js']
        }
    }
};
