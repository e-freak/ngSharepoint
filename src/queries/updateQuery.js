angular
	.module('ngSharepoint')
	.factory('UpdateQuery', ['$q', '$sp', 'WhereQuery', 'Query', function($q, $sp, WhereQuery, Query) {
		var UpdateQuery = function(list) {
			this.__list = list;
			this.__values = {};
			this.__where = null;
			return this;
		};
		UpdateQuery.prototype = new Query();
		UpdateQuery.prototype.set = function(key, value) {
			this.__values[key] = value;
			return this;
		};
		UpdateQuery.prototype.where = function(key) {
			this.__where = new WhereQuery(this, key);
			return this.__where;
		};
		UpdateQuery.prototype.__execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = $sp.getContext();
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where !== null) {
                    query.__where.push(caml);
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = query.__list.getItems(camlQuery);
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