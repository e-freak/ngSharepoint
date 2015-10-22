angular
	.module('ngSharepoint')
	.factory('InsertIntoQuery', ['$q', '$sp', 'Query', function($q, $sp, Query) {
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
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = $sp.getContext();
                var itemInfo = new SP.ListItemCreationInformation();
                var item = query.__list.addItem(itemInfo);
                query.packItem(item);
                item.update();
                clientContext.load(item);
                clientContext.executeQueryAsync(function(sender, args) {
                    resolve(query.unpackItem(item));
                }, function(sender, args) {
                    reject(args);
                });
            });
        };
	}]);