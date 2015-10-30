angular
	.module('ngSharepointLists', ['ngSharepoint']);
angular
	.module('ngSharepointLists')
	.factory('DeleteQuery', ['$q', '$sp', 'WhereQuery', 'Query', function($q, $sp, WhereQuery, Query) {
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
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where.length === 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    query.__where[0].push(caml);
                    caml.push('</Where>');
                    caml.push('</Query>');
                }else if (query.__where.length > 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    caml.push('<And>');
                    query.__where.forEach(function(where) {
                        where.push(caml);
                    });
                    caml.push('</And>');
                    caml.push('</Where>');
                    caml.push('</Query>');
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = list.getItems(camlQuery);
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
angular
	.module('ngSharepointLists')
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
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var itemInfo = new SP.ListItemCreationInformation();
                var item = list.addItem(itemInfo);
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
        return (InsertIntoQuery);
	}]);
angular
	.module('ngSharepointLists')
	.factory('JoinQuery', ['$q', '$sp', function ($q, $sp) {
		var JoinQuery = function() {

		};
		return (JoinQuery);
	}]);
angular
	.module('ngSharepointLists')
	.factory('Query', function() {
		var Query = function() {
			//this.__queries = {};
		};
        Query.prototype.unpackItem = function(item) {
            var query = this;
            var obj = {};
            if (Array.isArray(query.__values)) {
                query.__values.forEach(function(key) {
                    var value = item.get_item(key);
                    obj[key] = query.__trim(value);
                });                
            }else {
                Object.getOwnPropertyNames(query.__values).forEach(function(key) {
                    var value = item.get_item(key);
                    obj[key] = query.__trim(value);
                });
            }
            return obj;
        };
        Query.prototype.packItem = function(item) {
            var query = this;
            Object.getOwnPropertyNames(query.__values).forEach(function(key) {
                item.set_item(key, query.__trim(query.__values[key]));
            });
        };
        Query.prototype.then = function(success, reject) {
        	return this.__execute().then(success, reject);
        };
        Query.prototype.__trim = function(value) {
            if (value !== null && value !== undefined && typeof value == 'string') {
                return value.trim();
            }else {
                return value;
            }
        };
		return (Query);
	});
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
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where.length === 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    query.__where[0].push(caml);
                    caml.push('</Where>');
                    caml.push('</Query>');
                }else if (query.__where.length > 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    caml.push('<And>');
                    query.__where.forEach(function(where) {
                        where.push(caml);
                    });
                    caml.push('</And>');
                    caml.push('</Where>');
                    caml.push('</Query>');
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
angular
    .module('ngSharepointLists')
    .factory('$spList', ['$sp', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function ($sp, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            select: function(fields) {
                return new SelectQuery(fields);
            },
            update: function(list) {
                return new UpdateQuery(list);
            },
            insertInto: function(list) {
                return new InsertIntoQuery(list);
            },
            delete: function() {
                return new DeleteQuery();
            }
        });
    }]);
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
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where.length === 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    query.__where[0].push(caml);
                    caml.push('</Where>');
                    caml.push('</Query>');
                }else if (query.__where.length > 1) {
                    caml.push('<Query>');
                    caml.push('<Where>');
                    caml.push('<And>');
                    query.__where.forEach(function(where) {
                        where.push(caml);
                    });
                    caml.push('</And>');
                    caml.push('</Where>');
                    caml.push('</Query>');
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = list.getItems(camlQuery);
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
angular
	.module('ngSharepointLists')
	.factory('WhereQuery', function() {
        var WhereQuery = function(query, field) {
            this.__query = query;
            this.__field = field;
            this.__value = "";
            this.__operator = "";
            //this.__query.__queries.where.push(this);
            this.__operators = {
                BEGINS_WITH: ['<BeginsWith>', '</BeginsWith>'],
                CONTAINS: ['<Contains>', '</Contains>'],
                EQUALS: ['<Eq>', '</Eq>'],
                GREATER_EQUALS: ['<Geq>', '</Geq>'],
                GREATER: ['<Gt>', '</Gt>'],
                INCLUDES: ['<Includes>', '</Includes>'],
                IS_NOT_NULL: ['<IsNotNull>', '</IsNotNull>'],
                IS_NULL: ['<IsNull>', '</IsNull>'],
                LESS_EQUALS: ['<Leq>', '</Leq>'],
                LESS: ['<Lt>', '</Lt>'],
                NOT_EQUALS: ['<Neq>', '</Neq>'],
                NOT_INCLUDES: ['<NotIncludes>', '</NotIncludes>']
            };
        };
        WhereQuery.prototype.equals = function(value) {
            this.__operator = "equals";
            this.__value = value;
            return this.__query;
        };
        WhereQuery.prototype.beginsWith = function(value) {
            this.__operator = this.__operators.BEGINS_WITH;
        };
        WhereQuery.prototype.push = function(caml) {
            switch (this.__operator) {
                case "equals":
                    caml.push('<Eq>');
                    break;
            }
            caml.push('<FieldRef Name="' + this.__field + '"/>');
            caml.push('<Value Type="Number">' + this.__value + '</Value>');
            switch (this.__operator) {
                case "equals":
                    caml.push('</Eq>');
                    break;
            }
        };
        return (WhereQuery);
	});