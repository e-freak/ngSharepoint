module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ng-annotate');

	grunt.registerTask('default', ['jshint', 'concat:dev']);
	grunt.registerTask('dist', ['jshint', 'karma:dist', 'concat:dist', 'ngAnnotate:dist', 'uglify:dist', 'clean']);
	grunt.registerTask('test', ['jshint', 'concat:dev', 'karma:dev']);

	grunt.initConfig({
		concat: {
			dev: {
				src: ['src/*.js', 'src/**/*.js', '!src/*.spec.js', '!src/**/*.spec.js'],
				dest: 'dist/angular-sharepoint.js'
			},
			dist: {
				src: ['src/*.js', 'src/**/*.js', '!src/*.spec.js', '!src/**/*.spec.js'],
				dest: 'tmp/concat.js'
			}
		},
		jshint: {
			default: ['src/*.js', 'src/**/*.js', '!src/*.spec.js', '!src/**/*.spec.js']
		},
		ngAnnotate: {
			dist: {
				files: {
					'dist/angular-sharepoint.js': ['tmp/concat.js']
				}
			}
		},
		uglify: {
			dist: {
				compress: true,
				files: {
					'dist/angular-sharepoint.min.js': ['dist/angular-sharepoint.js']
				}
			}
		},
		karma: {
			options: {
				frameworks: ['jasmine'],
				files: [
					'bower_components/angular/angular.min.js',
					'bower_components/angular-mocks/angular-mocks.js',
					'src/**/*.js',
					'test/unit/**/*.js'
				],
				singleRun: true
			},
			dev: {
				browsers: ['Chrome']
			},
			dist: {
				browsers: ['PhantomJS']
			}
		},
		clean: [
			'tmp/'
		]
	});
};