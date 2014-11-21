/**
 * 
 */
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-nodemon');

	var config = {
		nodemon : {
			mythos : {
				script : 'mythos/index.js'
			},
			locations : {
				script : 'locations/index.js'
			},
			dev : {
				script : 'src/index.js'
			}
		}
	};

	grunt.initConfig(config);

	grunt.registerTask('default', [ 'nodemon:dev' ]);
};