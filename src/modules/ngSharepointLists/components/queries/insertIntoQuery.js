angular
	.module('ngSharepoint.Lists')
	.factory('InsertIntoQuery', ['$spList', 'Query', function($spList, Query) {
		var InsertIntoQuery = function(list) {
			this.__list = list;
			this.__values = {};
			return this;
		};
		InsertIntoQuery.prototype = new Query();
		InsertIntoQuery.prototype.value = function(key, value) {
			this.__values[key] = value;
			return this;
		};
		InsertIntoQuery.prototype.__execute = function() {
            return $spList.getList(this.__list).insert(this.__values);
        };
        return (InsertIntoQuery);
	}]);