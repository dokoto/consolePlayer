'use strict';

module.exports = function(grunt, options) {

    return {
        builds: {
            options: {
                create: ['builds/core/dev', 'builds/core/prod']
            }
        }
    };
};
