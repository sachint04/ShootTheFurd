module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jsdoc : {
        dist : {
            src: ['./*.js'],
            jsdoc: './node_modules/grunt-jsdoc/.bin/jsdoc',
            options: {
                destination: 'doc',
                configure: './node_modules/grunt-jsdoc/node_modules/jsdoc/conf.json'
//                template: './node_modules/ink-docstrap/template'
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');

};