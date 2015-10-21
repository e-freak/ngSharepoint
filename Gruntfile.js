module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'concat']);

	grunt.initConfig({
		concat: {
			default: {
				src: ['src/*.js', 'src/**/*.js'],
				dest: 'bin/angular-sharepoint.js'
			}
		},
		jshint: {
			default: ['src/*.js', 'src/**/*.js']
		}
	});
};