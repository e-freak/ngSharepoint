angular
	.module('ngSharepoint.Lists')
	.factory('SelectQuery', ['$spList', 'CamlBuilder', 'Query', 'WhereQuery', function($spList, CamlBuilder, Query, WhereQuery) {
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
            return $spList.getList(this.__list).select(camlBuilder.build());
        };
		return (SelectQuery);
	}]);