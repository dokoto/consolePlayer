'use strict';

module.exports = function(grunt, options) {


    return {
        builds: {
            src: ['builds/core/<%=args.mode%>/*', 'builds/maven/<%=args.mode%>/*']
        }
    };
};
