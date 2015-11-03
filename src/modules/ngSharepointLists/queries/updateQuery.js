angular
	.module('ngSharepointLists')
	.factory('UpdateQuery', ['$q', '$sp', 'WhereQuery', 'Query', function($q, $sp, WhereQuery, Query) {
		var UpdateQuery = function(list) {
			this.__list = list;
			this.__values = {};
			this.__where = [];
			return this;
		};
		UpdateQuery.prototype = new Query();
		UpdateQuery.prototype.set = function(key, value) {
			this.__values[key] = value;
			return this;
		};
		UpdateQuery.prototype.where = function(key) {
            var query = new WhereQuery(this, key);
            this.__where.push(query);
            return query;
		};
		UpdateQuery.prototype.__execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = $sp.getContext();
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var camlBuilder = new CamlBuilder();
                var camlView = camlBuilder.push('View');
                var queryTag;
                if (query.__where.length === 1) {
                    queryTag = camlView.push('Query');
                    query.__where[0].push(queryTag.push('Where'));
                }else if (query.__where.length > 1) {
                    queryTag = camlView.push('Query');
                    var andTag = queryTag.push('Where').push('And');
                    query.__where.forEach(function(where) {
                        where.push(andTag);
                    });
                }
                var items = list.getItems(camlBuilder.build());
                clientContext.load(items);
                clientContext.executeQueryAsync(function(sender, args) {
                    var itemIterator = items.getEnumerator();
                    while (itemIterator.moveNext()) {
                        var item = itemIterator.get_current();
                        query.packItem(item);
                        item.update();
                    }
                    clientContext.executeQueryAsync(function(sender, args) {
                        resolve(args);
                    }, function(sender, args) {
                        reject(args);
                    });
                }, function(sender, args) {
                    reject(args);
                });
            });
        };
        return (UpdateQuery);
	}]);