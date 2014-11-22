/**
 * 
 */
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-nodemon');
	
	var config = { 
		nodemon: {
			  dev: {
			    script: 'index.js'
			  }
			}
	}
	
	grunt.initConfig(config);
	
	grunt.registerTask('default', [ 'nodemon' ]);
};