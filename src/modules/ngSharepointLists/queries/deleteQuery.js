angular
	.module('ngSharepointLists')
	.factory('DeleteQuery', ['$q', '$sp', 'CamlBuilder', 'WhereQuery', 'Query', function($q, $sp, CamlBuilder, WhereQuery, Query) {
		var DeleteQuery = function() {
            this.__where = [];
            this.__list = null;
			return this;
		};
        DeleteQuery.prototype = new Query();
        DeleteQuery.prototype.from = function(list) {
            this.__list = list;
            return this;
        };
        DeleteQuery.prototype.where = function(key) {
            var query = new WhereQuery(this, key);
            this.__where.push(query);
            return query;
        };
		DeleteQuery.prototype.__execute = function() {
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
                clientContext.executeQueryAsync(
                    function(sender, args) {
                        var itemIterator = items.getEnumerator();
                        var a = [];
                        while (itemIterator.moveNext()) {
                           var item = itemIterator.get_current();
                           a.push(item);
                        }
                        a.forEach(function(item) {
                            item.deleteObject();
                        });
                        clientContext.executeQueryAsync(function(sender, args) {
                            resolve(args);
                        }, function(sender, args) {
                            reject(args);
                        });
                    },
                    function(sender, args) {
                        reject(args);
                    }
                );
            });
        };
        return (DeleteQuery);
	}]);