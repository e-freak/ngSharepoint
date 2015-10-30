angular
	.module('ngSharepointLists')
	.factory('SelectQuery', ['$q', '$sp', 'Query', 'WhereQuery', function($q, $sp, Query, WhereQuery) {
        var SelectQuery = function(fields) {
            this.__values = fields;
            this.__where = [];
            this.__limit = null;
            //this.__queries.where = [];
            //this.__queries.limit = [];
            return this;
        };
        SelectQuery.prototype = new Query();
        SelectQuery.prototype.from = function(list) {
        	this.__list = list;
        	return this;
        };
        SelectQuery.prototype.where = function(field) {
            var query = new WhereQuery(this, field);
            this.__where.push(query);
            return query;
        };
        SelectQuery.prototype.limit = function(amount) {
            this.__limit = amount;
            return this;
        };
        SelectQuery.prototype.__execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = $sp.getContext();
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var camlBuilder = new CamlBuilder();
                var camlView = camlBuilder.push('View');
                if (query.__where.length === 1) {
                    var camlWhere = camlView.push('Query').push('Where');
                    camlWhere.push(query.__where[0]);
                }else if (query.__where.length > 1) {
                    var camlAnd = camlView.push('Query').push('Where').push('And');
                    query.__where.forEach(function(where) {
                        camlAnd.push(where);
                    });
                }
                var viewFields = camlView.push('ViewFields');
                query.__values.forEach(function(field) {
                    viewFields.push('FieldRef', {Name: field});
                });
                if (query.__limit !== null) {
                    camlView.push('RowLimit', {}, query.__limit);
                }
                var items = list.getItems(camlBuilder.build());
                clientContext.load(items);
                clientContext.executeQueryAsync(
                    function(sender, args) {
                        var result = [];
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                           var item = itemIterator.get_current();
                           result.push(query.unpackItem(item));
                        } 
                        resolve(result);
                    },
                    function(sender, args) {
                        reject(args);
                    }
                );
            });
        };
		return (SelectQuery);
	}]);