'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-config')(grunt, {
    data: require('./grunt/configurator.js').doMap(grunt),
    init: true,
    loadGruntTasks: {
      config: require('./package.json'),
      scope: 'devDependencies',
      pattern: 'grunt-*'
    }
  });

  grunt.loadTasks('grunt/utils');
  grunt.loadTasks('grunt/tasks');
};
