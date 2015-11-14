angular
    .module('ngSharepoint.Mocks', ['ngSharepoint'])
    .config(function($spProvider) {
        $spProvider.setSiteUrl('localhost');
    });
