angular
	.module('ngSharepoint', []);
angular
	.module('ngSharepoint')
	.factory('CamlBuilder', ['CamlTag', function(CamlTag) {
		var CamlBuilder = function() {
			this.camlQuery = new SP.CamlQuery();
			this.caml = [];
		};
		CamlBuilder.prototype.push = function(tag, attr, value) {
			var camlTag;
			if (tag instanceof CamlTag) {
				camlTag = tag;
			}else {
				camlTag = new CamlTag(tag, attr, value);
			}
			this.caml.push(camlTag);
			return camlTag;
		};
		CamlBuilder.prototype.findByName = function(name) {
			var result = [];
			this.caml.forEach(function(caml) {
				if (caml.name == name) {
					result.push(caml);
				}
			});
			return result;
		};
		CamlBuilder.prototype.build = function() {
			for (var i = 0; i < 0; i++) {
				this.caml[i] = this.caml[i].build();
			}
			this.camlQuery.set_viewXml(this.caml.join(''));
			return this.camlQuery;
		};
		return (CamlBuilder);
	}]);
angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(name, attr, value) {
			this.name = name;
			this.attr = attr || {};
			this.value = value || undefined;
			this.caml = [];
		};
		CamlTag.prototype.__buildTag = function() {
			var tag = this;
			var xml = '<';
			xml += tag.name;
			if (Object.getOwnPropertyNames(tag.attr).length > 0) {
				Object.getOwnPropertyNames(tag.attr).forEach(function(key) {
					xml += ' ';
					xml += key;
					xml += '=';
					xml += '"' + tag.attr[key] + '"';
				});
			}
			if (this.caml.length === 0 && angular.isUndefined(this.value)) {
				xml += '/>';
			}else {
				xml += '>';
				if (angular.isDefined(this.value)) {
					xml += this.value;
				}
			}
			return xml;
		};
		CamlTag.prototype.push = function(tag, attr) {
			var camlTag;
			if (tag instanceof CamlTag) {
				camlTag = tag;
			}else {
				camlTag = new CamlTag(tag, attr);
			}
			this.caml.push(camlTag);
			return camlTag;
		};
		CamlTag.prototype.setValue = function(value) {
			this.value = value;
		};
		CamlTag.prototype.build = function() {
			var query = this.__buildTag();
			for (var i = 0; i < this.caml.length; i++) {
				query += this.caml[i].build();
			}
			if (this.caml.length > 0 || angular.isDefined(this.value)) {
				query += '</' + this.name + '>';
			}
			return query;
		};
		return (CamlTag);
	});
angular
  .module('ngSharepoint')
  .factory('SPContext', ['$q', '$sp', function($q, $sp) {
    var SPContext = function() {
      this.context = $sp.getContext();
    };
    SPContext.prototype.getLists = function () {
      var sp = this;
      return $q(function(resolve, reject) {
        var lists = sp.context.get_web().get_lists();
        sp.context.load(lists);
        sp.context.executeQueryAsync(function(sender, args) {
          var result = [];
          var listEnumerator = lists.getEnumerator();
          while (listEnumerator.moveNext()) {
            var list = lists.get_current();
            
          }
        });
      });
    };
    return (SPContext);
  }]);

angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl = "";
		var connMode = "JSOM"; //possible values: JSOM, REST
		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
			},
			setConnectionMode: function(connMode) { //Only JSOM Supported for now
				if (connMode == "JSOM" || connMode == "REST") {
					this.connMode = connMode;
				}
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getConnectionMode: function() {
						return connMode;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					}
				});
			}
		};
	});

angular
	.module('ngSharepointLists', ['ngSharepoint']);
angular
	.module('ngSharepointLists')
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
                        camlWhere.push(query.__where[0]);
                    }else if (query.__where.length > 1) {
                        var camlAnd = queryTag.push('Where').push('And');
                        query.__where.forEach(function(where) {
                            camlAnd.push(where);
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
angular
	.module('ngSharepointLists')
	.factory('WhereQuery', function() {
        var WhereQuery = function(query, field) {
            this.__query = query;
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
            if (typeof field == "string") {
                this.__field = field;
            }else {
                this.__fields = field;
                this.__operator = "equals";
            }
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
            var query = this;
            if (angular.isUndefined(query.__fields)) {
                var op;
                switch (query.__operator) {
                    case "equals":
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
    .module('ngSharepointLists')
    .factory('$spList', ['$sp', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function ($sp, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
              return null;
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
    }])
    .factory('SPList', ['$q', '$http', '$sp', function($q, $http, $sp) {
      var SPList = function(title) {
        this.title = title;
        if ($sp.getConnectionMode() == "JSOM") {
          this.__list = new JsomSPList(title);
        }else {
          this.__list = new RestSPList(title);
        }
      };
      SPList.prototype.insert = function(data) {
        return this.__list.insert(data);
      };
      SPList.prototype.select = function(query) {
        return this.__list.select(query);
      };
      SPList.prototype.delete = function(query) {
        return this.__list.delete(query);
      };
      var RestSPList = function() {
        this.title = title;
      };
      RestSPList.prototype.select = function(query) {
        var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/GetItems";
        var body = {
          query: {
            __metadata: {
              type: "SP.CamlQuery"
            },
            ViewXml: query.build()
          }
        };
        var headers = {
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "Accept": "application/json; odata=verbose",
          "Content-Type": "application/json; odata=verbose"
        };
        return $q(function(resolve, reject) {
          $http({
            method: 'POST',
            url: $sp.getSiteUrl() + endpoint,
            data: body,
            headers: headers
          }).then(function(data) {
            //TODO: Parse Result
          }, reject);
        });
      };
      var JsomSPList = function(title) {
        this.title = title;
      };
      JsomSPList.prototype.select = function(query) {
        return $q(function(resolve, reject) {
          var context = $sp.getContext();
          var list = context.get_web().get_lists().getByTitle(this.title);
          var items = list.getItems(query.build());
          context.load(items);
          context.executeQueryAsync(function() {
            var result = [];
            var itemIterator = items.getEnumerator();
            while (itemIterator.moveNext()) {
              var item = itemIterator.get_current();
              result.push(query.unpackItem(item));
            }
            resolve(result);
          }, function(sender, args) {
            reject(args);
          });
        });
      };
      return (SPList);
    }]);

angular
  .module('ngSharepointUsers', ['ngSharepoint']);
