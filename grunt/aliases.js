'use strict';

module.exports = function(grunt, options) {

    let DEV_TASKS = [
        'copy:constants',
        'jshint',
        'mkdir:builds',
        'clean:builds',
        'webpack:dev',
        'copy:test'
    ];

    let PROD_TASKS = [
      'copy:constants',
      'jshint',
      'mkdir:builds',
      'clean:builds',
      'webpack:prod'
    ];


    function resolve(task, args) {
        let tasker = [];

        if (args.mode === 'dev') {
            tasker = DEV_TASKS.slice();
        } else if (args.mode === 'prod') {
            tasker = PROD_TASKS.slice();
        }
        switch (task) {
            case 'build-core':
                //tasker.push('whatever');
                break;
        }

        return tasker;
    }


    if (options && options.args) {
        let tasks = {
            'default': ['help'],
            'build-core': resolve('build-core', options.args)
        };

        return tasks;
    } else {
        return {
            'default': ['help']
        };
    }
};
