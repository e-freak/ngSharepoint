module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-stripcomments');

	grunt.registerTask('default', ['jshint', 'concat:dev', 'clean:coverage', 'karma:dist']);
	grunt.registerTask('dist', ['jshint', 'eslint', 'jscs', 'clean:coverage', 'karma:dist', 'concat:dist', 'ngAnnotate:dist', 'comments', 'uglify:dist', 'clean:build']);
	grunt.registerTask('test', ['jshint', 'eslint', 'jscs', 'clean:coverage', 'karma:dev']);

	grunt.initConfig({
		concat: {
			dev: {
				src: ['src/*.js', 'src/**/*.js', '!src/modules/ngSharepointMocks/*'],
				dest: 'dist/angular-sharepoint.js'
			},
			dist: {
				files: {
					'tmp/angular-sharepoint.js':['src/modules/core/*.module.js', 'src/modules/core/**/*.js', '!src/modules/core/**/*.spec.js'],
					'tmp/angular-sharepoint-lists.js':['src/modules/lists/*.module.js', 'src/modules/lists/**/*.js'],
					'tmp/angular-sharepoint-users.js':['src/modules/users/*.module.js', 'src/modules/users/**/*.js'],
					'tmp/angular-sharepoint-full.js':['tmp/angular-sharepoint.js', 'tmp/*.js'],
					'tmp/angular-sharepoint-mocks.js':['src/modules/mocks/*.module.js', 'src/modules/mocks/**/*.js']
				}
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			default: ['src/*.js', 'src/**/*.js', '!src/**/*.spec.js']
		},
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			default: ['src/**/*.js', '!src/**/*.spec.js']
		},
		jscs: {
			options: {
				config: true
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
		comments: {
			default: {
				src: ['dist/*.js']
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
					'src/**/*.module.js',
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
