/**
 * 
 */
module.exports = function(grunt) {

	var config = {};

	// Mocha tests
	grunt.loadNpmTasks('grunt-mocha-test');
	config.mochaTest = {
		test : {
			options : {
				reporter : 'spec',
				captureFile : 'report.txt',
				quite : false,
				clearRequireCache : false
			},
			src : [ 'crawler/test/*.mocha.js' ]
		}
	};

	// Nodemon
	grunt.loadNpmTasks('grunt-nodemon');
	config.nodemon = {
		mythos : {
			script : 'mythos/index.js'
		},
		allies : {
			script : 'allies/index.js'
		},
		locations : {
			script : 'locations/index.js'
		},
		otherworld: {
			script : 'otherWorld/index.js'
		},
		monsters: {
			script : 'monsters/index.js'
		},
		dev : {
			script : 'crawler/index.js'
		}
	};

	// contrib-watch
	grunt.loadNpmTasks('grunt-contrib-watch');
	config.watch = {
		tests : {
			files : [ 'crawler/**/*.js' ],
			tasks : [ 'mochaTest' ],
			options : {
				interrupt : true
			}
		}
	};
	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
		grunt.log.writeln('buuuuuuu... running watchers')
	});

	grunt.initConfig(config);

	grunt.registerTask('default', 'watch:tests');
};
