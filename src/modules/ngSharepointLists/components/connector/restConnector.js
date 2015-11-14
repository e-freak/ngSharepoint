angular
    .module('ngSharepoint.Lists')
    .factory('RESTConnector', function($q, $sp, $spLoader) {
        return ({
            getLists: function() {
                return $q(function(resolve, reject) {

                });
            }
        });
    });