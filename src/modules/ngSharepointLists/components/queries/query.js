angular
    .module('ngSharepoint.Lists')
    .factory('Query', function() {
        var Query = function() {
            //this.__queries = {};
        };
        Query.prototype.then = function(success, reject) {
            return this.__execute().then(success, reject);
        };
        return (Query);
    });