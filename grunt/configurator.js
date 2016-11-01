'use strict';

var exports = module.exports = {};

var path = require('path');
var utils = {
    misc: require('./utils/misc')
};

class Configurator {

    constructor(grunt, jsonConfigFile) {
        this.jsonConfigFile = jsonConfigFile;
        this.data = require(jsonConfigFile);
        this.grunt = grunt;
    }

    explore(ptr, args) {
        if (args.length === 1) {
            if (ptr[args[0]] === undefined) {
                return {
                    value: null,
                    error: true,
                    fieldError: args[0]
                };
            } else {
                return {
                    value: ptr[args[0]],
                    error: false,
                    fieldError: null
                };
            }
        } else {
            if (ptr[args[0]] === undefined) {
                return {
                    value: null,
                    error: true,
                    fieldError: args[0]
                };
            }
            var newPtr = ptr[args[0]];
            args = args.splice(1);
            return this.explore(newPtr, args);
        }
    }

    fetch(args) {
        var params = args.slice(0);
        var result = this.explore(this.data, params);
        if (result.error === true) {
            var literal = '';
            for (var arg in args) {
                literal += '[' + args[arg] + ']';
            }
            console.error('Field: "' + result.fieldError + '" not found as : confEnv' + literal + '. Check your json config file "' + this.jsonConfigFile + '"');
            this.grunt.fail.fatal("FATAL ERROR");
        } else {
            return result.value;
        }
    }
}

var doMap = {
    mkConf: function(grunt) {
        return {
            base: new Configurator(grunt, './config/conf_base.json')
        };
    },

    global: function(grunt) {
        var data = {};

        return data;
    },

    args: function(grunt, data) {
        const packageApp = grunt.file.readJSON('package.json');
        const validParams = require('./config/valid_values.json');

        data.baseDir = process.cwd();
        data.pkg = packageApp;

        data.args = {};
        if (grunt.option('versionApp') === undefined) {
            grunt.fail.fatal('El parametro --versionApp es obliglatorio para el constructor');
        } else {
            data.args.versionApp = grunt.option('versionApp');
        }

        if (grunt.option('mode') === undefined) {
            grunt.fail.fatal('El parametro --mode es obliglatorio para el constructor');
        } else {
            data.args.mode = (grunt.option('mode') || 'dev').toLowerCase();
            if (validParams.args.mode.indexOf(data.args.mode) === -1) {
                grunt.fail.fatal('El parametro --mode solo puede contener los valores: ' + validParams.args.mode);
            }
        }

        if (grunt.option('mocks') === undefined) {
            grunt.fail.fatal('El parametro --mocks es obliglatorio para el constructor');
        } else {
            data.args.mocks = utils.misc.convBoolean(grunt.option, 'mocks', false);
        }

        data.args.verbose = utils.misc.convBoolean(grunt.option, 'verbose', false);

        data.args.builddate = new Date().toLocaleString();
        data.args.target = grunt.cli.tasks[0].substr(grunt.cli.tasks[0].indexOf('-') + 1);

        return data;
    },

    base: function(grunt, conf, data) {
        data.base = {};

        data.base.appName = conf.base.fetch(['appName']);
        data.base.proxy = conf.base.fetch(['proxy']);
        data.base.buildFolder = conf.base.fetch(['buildFolder']);
        data.base.sourcesFolder = conf.base.fetch(['sourcesFolder']);
        data.base.proyectFolderName = __dirname.substr(__dirname.lastIndexOf(path.sep) + 1);

        return data;
    },

    git: function(grunt, conf, data) {
        data.git = conf.git.data;

        return data;
    },


};

function header(grunt, data) {
    grunt.log.writeln('*********************************************************************');
    grunt.log.writeln('BOILDERPLATE ' + data.pkg.version + 'v');
    grunt.log.writeln('*********************************************************************');
    grunt.log.writeln('Project           : ' + data.args.target);
    grunt.log.writeln('App version       : ' + data.args.versionApp);
    grunt.log.writeln('Compilation Mode  : ' + data.args.mode);
    grunt.log.writeln('Mock actived      : ' + data.args.mocks);
    grunt.log.writeln('Build Date        : ' + data.args.builddate);
    grunt.log.writeln('Verbose           : ' + data.args.verbose);
    grunt.log.writeln('**********************************************************************');
}

function mainProcess(grunt, data) {
    // CONFIG FILES
    var conf = doMap.mkConf(grunt);

    // ARGUMENTS
    data = doMap.args(grunt, data);

    // BASE
    data = doMap.base(grunt, conf, data);

    // Header
    header(grunt, data);

    return data;
}

exports.doMap = function(grunt) {

    // GLOBAL
    var data = doMap.global(grunt);
    if (process.argv.length === 2) {
        data.args = {};
    } else if (process.argv.length > 2) {
        data = mainProcess(grunt, data);
    }

    return data;
};
