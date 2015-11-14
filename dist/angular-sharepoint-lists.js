angular
	.module('ngSharepoint.Lists', ['ngSharepoint']);
angular
	.module('ngSharepoint.Lists')
	.factory('DeleteQuery', ['SPList', 'CamlBuilder', 'WhereQuery', 'Query', function(SPList, CamlBuilder, WhereQuery, Query) {
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
            var camlBuilder = new CamlBuilder();
            var camlView = camlBuilder.push('View');
            var queryTag;
            if (this.__where.length === 1) {
                queryTag = camlView.push('Query');
                this.__where[0].push(queryTag.push('Where'));
            }else if (this.__where.length > 1) {
                queryTag = camlView.push('Query');
                var andTag = queryTag.push('Where').push('And');
                this.__where.forEach(function(where) {
                    where.push(andTag);
                });
            }
            return new SPList(this.__list).delete(camlBuilder.build());
        };
        return (DeleteQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('InsertIntoQuery', ['SPList', 'Query', function(SPList, Query) {
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
            return new SPList(this.__list).insert(this.__values);
        };
        return (InsertIntoQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('JoinQuery', ['$q', '$sp', function ($q, $sp) {
		var JoinQuery = function() {

		};
		return (JoinQuery);
	}]);
angular
    .module('ngSharepoint.Lists')
    .factory('Query', function() {
        var Query = function() {
            //this.__queries = {};
        };
        Query.prototype.then = function(success, reject) {
            return this.__execute().then(success, reject);
        };
        return (Query);
    });
angular
	.module('ngSharepoint.Lists')
	.factory('SelectQuery', ['SPList', 'CamlBuilder', 'Query', 'WhereQuery', function(SPList, CamlBuilder, Query, WhereQuery) {
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
            return new SPList(this.__list).select(camlBuilder.build());
        };
		return (SelectQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('UpdateQuery', ['SPList', 'CamlBuilder', 'WhereQuery', 'Query', function(SPList, CamlBuilder, WhereQuery, Query) {
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
            var camlBuilder = new CamlBuilder();
            var camlView = camlBuilder.push('View');
            var queryTag;
            if (this.__where.length === 1) {
                queryTag = camlView.push('Query');
                this.__where[0].push(queryTag.push('Where'));
            }else if (this.__where.length > 1) {
                queryTag = camlView.push('Query');
                var andTag = queryTag.push('Where').push('And');
                this.__where.forEach(function(where) {
                    where.push(andTag);
                });
            }
            return new SPList(this.__list).update(camlBuilder.build(), this.__values);
        };
        return (UpdateQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('WhereQuery', function() {
        var WhereQuery = function(query, field) {
            this.__query = query;
            this.__value = '';
            this.__operator = '';
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
            if (typeof field === 'string') {
                this.__field = field;
            }else {
                this.__fields = field;
                this.__operator = 'equals';
            }
        };
        WhereQuery.prototype.equals = function(value) {
            this.__operator = 'equals';
            this.__value = value;
            return this.__query;
        };
        WhereQuery.prototype.beginsWith = function(value) {
            this.__operator = this.__operators.BEGINS_WITH;
        };
        WhereQuery.prototype.push = function(caml) {
            var query = this;
            if (angular.isUndefined(query.__fields)) {
                var op;
                switch (query.__operator) {
                    case 'equals':
                        op = caml.push('Eq');
                        break;
                }
                op.push('FieldRef', {Name: query.__field});
                op.push('Value', {Type: 'Number'}, query.__value);
            }else {
                var and = caml.push('And');
                Object.getOwnPropertyNames(query.__fields).forEach(function(field) {
                    var op = and.push('Eq');
                    op.push('FieldRef', {Name: field});
                    op.push('Value', {Type: 'Number'}, query.__fields[field]);
                });
            }
        };
        return (WhereQuery);
	});
angular
    .module('ngSharepoint.Lists')
    .factory('JsomSPList', ['$q', '$sp', '$spLoader', '$spCamlParser', function($q, $sp, $spLoader, $spCamlParser) {
        var JsomSPList = function(title) {
            this.title = title;
        };
        JsomSPList.prototype.select = function(query) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
                    var items = list.getItems(camlQuery);
                    context.load(items);
                    context.executeQueryAsync(function() {
                        var result = [];
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                            var item = itemIterator.get_current();
                            result.push(that.__unpack(item, $spCamlParser.parse(query).getViewFields()));
                        }
                        resolve(result);
                    }, function(sender, args) {
                        reject(args);
                    });
                });
            });
        };
        JsomSPList.prototype.insert = function(data) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {                    
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var itemInfo = new SP.ListItemCreationInformation();
                    var item = list.addItem(itemInfo);
                    that.__pack(item, data);
                    item.update();
                    clientContext.load(item);
                    clientContext.executeQueryAsync(function(sender, args) {
                        resolve(data);
                    }, function(sender, args) {
                        reject(args);
                    });
                });
            });
        };
        JsomSPList.prototype.delete = function(query) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
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
            });
        };
        JsomSPList.prototype.update = function(query, data) {
            var list = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
                    var items = list.getItems(camlQuery);
                    clientContext.load(items);
                    clientContext.executeQueryAsync(function(sender, args) {
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                            var item = itemIterator.get_current();
                            that.__pack(item, data);
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
            });
        };
        JsomSPList.prototype.__pack = function(item, data) {
            Object.getOwnPropertyNames(data).forEach(function(key) {
                var value = data[key];
                if (value !== null && value !== undefined && typeof value === 'string') {
                    value = value.trim();
                }
                item.set_item(key, value);
            });
        };
        JsomSPList.prototype.__unpack = function(item, fields) {
            var query = this;
            var obj = {};
            var cols = fields;
            if (!Array.isArray(fields)) {
                cols = Object.getOwnPropertyNames(fields);
            }
            cols.forEach(function(key) {
                    var value = item.get_item(key);
                    if (value !== null && value !== undefined && typeof value === 'string') {
                        value = value.trim();
                    }
                    obj[key] = value;
            });                
            return obj;
        };
        return (JsomSPList);
    }]);
angular
	.module('ngSharepoint.Lists')
	.factory('RestSPList', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
		var RestSPList = function(title) {
			this.title = title;
		};
		RestSPList.prototype.select = function(query) {
			var endpoint = '_api/web/Lists/GetByTitle(\'' + this.title + '\')/GetItems';
			var body = {
				query: {
					__metadata: {
						type: 'SP.CamlQuery'
					},
					ViewXml: query
				}
			};
			return $q(function(resolve, reject) {
				$spLoader.query({
					method: 'POST',
					url: endpoint,
					data: body
				}).then(function(data) {
					//TODO: Parse Result
				}, reject);
			});
		};
		RestSPList.prototype.insert = function(data) {
			var endpoint = '_api/web/Lists/GetByTitle(\'' + this.title + '\')/items';
			var body = {
				__metadata: {
					type: 'SP.Data.TestListItem'
				}
			};
			Object.getOwnPropertyNames(data).forEach(function(key) {
				var value = data[key];
				if (value !== null && value !== undefined && typeof value === 'string') {
					value = value.trim();
				}
				body[key] = value;
			});
			return $q(function(resolve, reject) {
				$spLoader.query({
					method: 'POST',
					url: endpoint,
					data: body
				}).then(function(data) {
					//TODO: Parse Result
				}, reject);
			});
		};
		RestSPList.prototype.delete = function(query) {
			//TODO: Implement
		};
		RestSPList.prototype.update = function(query, data) {
			//TODO: Implement
		};
		return (RestSPList);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('SPList', ['$sp', '$spLog', 'RestSPList', 'JsomSPList', function($sp, $spLog, RestSPList, JsomSPList) {
      /**
       * @ngdoc object
       * @name  SPList
       * @param {string} title The List Title
       * 
       * @module  ngSharepoint.Lists
       *
       * @description
       * SPList represents a Sharepoint List
       */
      var SPList = function(title) {
        this.title = title;
        if ($sp.getConnectionMode() === 'JSOM') {
          this.__list = new JsomSPList(title);
        }else {
          this.__list = new RestSPList(title);
        }
      };
      /**
       * @ngdoc function
       * @name  SPList#insert  
       * @param  {object} data The Data you wanna insert
       * @return {Promise}      A Promise which resolves when the insertion was sucessful
       */
      SPList.prototype.insert = function(data) {
        return this.__list.insert(data).catch($spLog.error);
      };
      /** 
       * @ngdoc function
       * @name  SPList#select
       * @param {SP.CamlQuery} query A CamlQuery to filter for
       * @return {Promise} A Promise which resolves to the selected data
       */
      SPList.prototype.select = function(query) {
        return this.__list.select(query).catch($spLog.error);
      };
      /**
       * @ngdoc function
       * @param  {SP.CamlQuery} query A CamlQuery to filter for
       * @return {Promise}       [description]
       */
      SPList.prototype.delete = function(query) {
        return this.__list.delete(query).catch($spLog.error);
      };
      /**
       * @ngdoc function
       * @param  {SP.CamlQuery} query  A CamlQuery which selects the rows to update
       * @param  {object} data The Data you wanna update 
       * @return {Promise}        A Promise which resolves when the update was sucessfull
       */
      SPList.prototype.update = function(query, data) {
        return this.__list.update(query, data).catch($spLog.error);
      };
      return (SPList);
	}]);
angular
	.module('ngSharepoint.Lists')
	.directive('spList', ['$spList', function($spList) {
		return {
			restrict: 'A',
			scope: {
				'spList': '@',
				'select': '=spSelect',
				'where': '=spWhere',
				'limit': '=spLimit',
				'order': '=spOrder',
				'asc': '=spAsc'
			},
			transclude: true,
			template: '<div ng-repeat="item in items" ng-transclude></div>',
			controller: function() {
				if (angular.isUndefined($scope.select)) $scope.select = '*';
				if (angular.isUndefined($scope.asc)) $scope.asc = true;
				var query = $spList.select($scope.select);
				if (angular.isDefined($scope.where)) {
					query.where($scope.where);
				}
				if (angular.isDefined($scope.limit)) {
					query.limit($scope.limit);
				}
				if (angular.isDefined($scope.order)) {
					query.orderBy($scope.order, $scope.asc);
				}
				query.then(function(data) {
					$scope.items = data;
				}, function(error) {
					console.error(error);
				});
			}
		};
	}]);
angular
    .module('ngSharepoint.Lists')
    .factory('$spList', ['SPList', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function (SPList, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
              return new SPList(title);
            },
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