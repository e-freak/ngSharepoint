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
            if (this.__where.length > 0 || this.__order.length > 0) {
                var queryTag = camlView.push('Query');
                if (this.__where.length === 1) {
                    var camlWhere = queryTag.push('Where');
                    this.__where[0].push(camlWhere);
                }else if (this.__where.length > 1) {
                    var camlAnd = queryTag.push('Where').push('And');
                    this.__where.forEach(function(where) {
                        where.push(camlAnd);
                    });
                }
                if (this.__order.length > 0) {
                    var camlOrder = queryTag.push('OrderBy');
                    this.__order.forEach(function(order) {
                        camlOrder.push('FieldRef', {Name: order.field, Ascending: order.asc});
                    });
                }
            }
            var viewFields = camlView.push('ViewFields');
            this.__values.forEach(function(field) {
                viewFields.push('FieldRef', {Name: field});
            });
            if (this.__limit !== null) {
                camlView.push('RowLimit', {}, this.__limit);
            }
            return $spList.getList(this.__list).select(camlBuilder.build());
        };
		return (SelectQuery);
	}]);