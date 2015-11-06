angular
	.module('ngSharepointLists')
	.factory('SelectQuery', ['$q', '$sp', 'CamlBuilder', 'Query', 'WhereQuery', function($q, $sp, CamlBuilder, Query, WhereQuery) {
        var SelectQuery = function(fields) {
            this.__values = fields;
            this.__where = [];
            this.__limit = null;
            this.__order = [];
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
        SelectQuery.prototype.orderBy = function(field, asc) {
            if (angular.isUndefined(asc)) {
                asc = true;
            }
            this.__order.push({field: field, asc: asc});
            return this;
        };
        SelectQuery.prototype.__execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = $sp.getContext();
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var camlBuilder = new CamlBuilder();
                var camlView = camlBuilder.push('View');
                if (query.__where.length > 0 || query.__order.length > 0) {
                    var queryTag = camlView.push('Query');
                    if (query.__where.length === 1) {
                        var camlWhere = queryTag.push('Where');
                        query.__where[0].push(camlWhere);
                    }else if (query.__where.length > 1) {
                        var camlAnd = queryTag.push('Where').push('And');
                        query.__where.forEach(function(where) {
                            where.push(camlAnd);
                        });
                    }
                    if (query.__order.length > 0) {
                        var camlOrder = queryTag.push('OrderBy');
                        query.__order.forEach(function(order) {
                            camlOrder.push('FieldRef', {Name: order.field, Ascending: order.asc});
                        });
                    }
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