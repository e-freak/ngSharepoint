angular
    .module('ngSharepoint.Lists')
    .factory('RESTConnector', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
        return ({
            getLists: function() {
                return $q(function(resolve, reject) {

                });
            }
        });
    }]);