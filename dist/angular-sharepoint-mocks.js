angular
    .module('ngSharepoint.Mocks', ['ngSharepoint'])
    .config(['$spProvider', function($spProvider) {
        $spProvider.setSiteUrl('localhost');
    }]);
