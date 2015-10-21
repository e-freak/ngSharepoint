angular
	.module('ngSharepoint')
	.factory('Query', ['$q', function($q) {
		var Query = function() {};
		Query.prototype.unpackItem = function(item) {
			var obj = {};
            this.__fields.forEach(function(field) {
                var value = item.get_item(field);
                obj[field] = value;
            });
            return obj;
		};
		return (Query);
	}]);