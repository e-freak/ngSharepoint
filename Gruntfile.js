module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ng-annotate');

	grunt.registerTask('default', ['jshint', 'concat:dev', 'clean:coverage', 'karma:dist']);
	grunt.registerTask('dist', ['jshint', 'concat:dist', 'ngAnnotate:dist', 'clean:coverage', 'karma:dist', 'uglify:dist', 'clean:build']);
	grunt.registerTask('test', ['jshint', 'concat:dev', 'clean:coverage', 'karma:dev']);

	grunt.initConfig({
		concat: {
			dev: {
				src: ['src/*.js', 'src/**/*.js', '!src/modules/ngSharepointMocks/*'],
				dest: 'dist/angular-sharepoint.js'
			},
			dist: {
				files: {
					//'tmp/angular-sharepoint.js':['src/*.js', 'src/**/*.js', '!src/**/*.spec.js', '!src/modules/ngSharepointMocks/**/*.js'],
					'tmp/angular-sharepoint-full.js':['src/*.js', 'src/**/*.js', '!src/**/*.spec.js', '!src/modules/ngSharepointMocks/**/*.js'],
					'tmp/angular-sharepoint.js':['src/modules/ngSharepoint/**/*.js', '!src/modules/ngSharepoint/**/*.spec.js'],
					'tmp/angular-sharepoint-lists.js':['src/modules/ngSharepointLists/**/*.js'],
					'tmp/angular-sharepoint-users.js':['src/modules/ngSharepointUsers/**/*.js'],
					'tmp/angular-sharepoint-mocks.js':['src/modules/ngSharepointMocks/**/*.js']
				}
			}
		},
		jshint: {
			default: ['src/*.js', 'src/**/*.js', '!src/**/*.spec.js']
		},
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			default: ['src/**/*.js', '!src/**/*.spec.js']
		},
		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			dist: {
				files: {
					'dist/angular-sharepoint.js': ['tmp/angular-sharepoint.js'],
					'dist/angular-sharepoint-lists.js': ['tmp/angular-sharepoint-lists.js'],
					'dist/angular-sharepoint-users.js': ['tmp/angular-sharepoint-users.js'],
					'dist/angular-sharepoint-full.js': ['tmp/angular-sharepoint-full.js'],
					'dist/angular-sharepoint-mocks.js': ['tmp/angular-sharepoint-mocks.js']
				}
			}
		},
		uglify: {
			dist: {
				compress: true,
				files: {
					'dist/angular-sharepoint.min.js': ['dist/angular-sharepoint.js'],
					'dist/angular-sharepoint-lists.min.js': ['dist/angular-sharepoint-lists.js'],
					'dist/angular-sharepoint-users.min.js': ['dist/angular-sharepoint-users.js'],
					'dist/angular-sharepoint-full.min.js': ['dist/angular-sharepoint-full.js'],
					'dist/angular-sharepoint-mocks.min.js': ['dist/angular-sharepoint-mocks.js']
				}
			}
		},
		karma: {
			options: {
				frameworks: ['jasmine'],
				files: [
					'bower_components/angular/angular.min.js',
					'bower_components/angular-mocks/angular-mocks.js',
					'src/**/*.js'
				],
				singleRun: true,
				preprocessors: {
					'src/**/!(*.spec).js': 'coverage'
				},
				reporters: ['progress', 'coverage'],
				coverageReporter: {
					type : 'lcov',
					subdir : '.'
				}
			},
			dev: {
				browsers: ['Chrome']
			},
			dist: {
				browsers: ['PhantomJS']
			}
		},
		clean: {
			build: [
				'tmp/'
			],
			coverage: [
				'coverage/'
			]
		}
	});
};
