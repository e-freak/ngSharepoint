angular
	.module('ngSharepoint')
	.factory('SelectQuery', ['$q', '$sp', 'Query', 'WhereQuery', function($q, $sp, Query, WhereQuery) {
        var SelectQuery = function(fields) {
            this.__values = fields;
            this.__where = null;
            this.__limit = null;
            this.__queries.where = [];
            this.__queries.limit = [];
            return this;
        };
        SelectQuery.prototype = new Query();
        SelectQuery.prototype.from = function(list) {
        	this.__list = list;
        	return this;
        };
        SelectQuery.prototype.where = function(field) {
            this.__where = new WhereQuery(this, field);
            return this.__where;
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
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where !== null) {
                    query.__where.push(caml);
                }
                caml.push('<ViewFields>');
                query.__values.forEach(function(field) {
                    caml.push('<FieldRef Name="' + field + '"/>');
                });
                caml.push('</ViewFields>');
                if (query.__limit !== null) {
                    caml.push('<RowLimit>' + query.__limit + '</RowLimit>');
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = list.getItems(camlQuery);
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