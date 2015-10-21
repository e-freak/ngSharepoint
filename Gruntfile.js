module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['jshint', 'concat']);
	grunt.registerTask('release', ['jshint', 'concat', 'uglify']);

	grunt.initConfig({
		concat: {
			default: {
				src: ['src/*.js', 'src/**/*.js'],
				dest: 'bin/angular-sharepoint.js'
			}
		},
		jshint: {
			default: ['src/*.js', 'src/**/*.js']
		},
		uglify: {
			release: {
				compress: true,
				files: {
					'bin/angular-sharepoint.min.js': ['bin/angular-sharepoint.js']
				}
			}
		}
	});
};