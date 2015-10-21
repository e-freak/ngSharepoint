angular
	.module('ngSharepoint')
	.factory('SelectQuery', ['$q', 'Query', function($q, Query) {
		var SelectQuery = function(list, fields) {
            this.__fields = fields;
            this.__where = null;
            this.__limit = null;
		};
		SelectQuery.prototype = new Query();
		SelectQuery.prototype.then = function(success, error) {
			return $q(function(resolve, reject) {
				
			});
		};
		return (SelectQuery);
	}]);