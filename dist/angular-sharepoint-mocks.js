angular
	.module('ngSharepointMocks', ['ngSharepoint'])
	.config(['$spProvider', function($spProvider) {
		$spProvider.setSiteUrl('localhost');
	}]);