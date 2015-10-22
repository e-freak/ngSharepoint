angular
	.module('ngSharepoint')
	.factory('DeleteQuery', ['$q', '$sp', 'WhereQuery', 'Query', function($q, $sp, WhereQuery, Query) {
		var DeleteQuery = function() {
			return this;
		};
        DeleteQuery.prototype.from = function(list) {
            
            return this;
        };
        DeleteQuery.prototype.join = function(list) {
            return {
                __query: this,
                on: function(row1, row2) {

                    return __query;
                };
            };
        }
		DeleteQuery.prototype = new Query();
		DeleteQuery.prototype.__execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
            });
        };
	}]);