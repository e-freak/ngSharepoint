angular
	.module('ngSharepoint', []);
angular
	.module('ngSharepoint')
	.factory('$spCamlParser', function() {
		var CamlParser = function(query) {
			var parser = this;
			parser.viewFields = []; //['', '',...]
			parser.query = query; //[]
			parser.where = {}; //{concat: 'and', queries: [{comparator: '', column: '', value: ''}, {concat: 'or', queries: []}]}
			parser.orderBy = []; //[{col: '', asc: true}]
			parser.limit = -1;
			parser.doc = new DOMParser().parseFromString(query, 'text/xml');
			var viewFieldsTags = parser.doc.getElementsByTagName('ViewFields');
			if (viewFieldsTags.length === 1) {
				var fieldTags = viewFieldsTags[0].getElementsByTagName('FieldRef');
				for (var i = 0; i < fieldTags.length; i++) {
					var field = fieldTags[i];
					parser.viewFields.push(field.attributes.Name.value);
				}
			}
			var queryTags = parser.doc.getElementsByTagName('Query');
			if (queryTags.length === 1) {
				var queryTag = queryTags[0];
				for (var j = 0; j < queryTag.childNodes.length; j++) {
					var queryNode = queryTag.childNodes[j];
					if (queryNode.nodeName === 'Where' || queryNode.nodeName === 'And' || queryNode.nodeName === 'Or') {
						parser.__parseWhere(queryNode, parser.where);
					}
				}
			}
			var rowLimitTags = parser.doc.getElementsByTagName('RowLimit');
			if (rowLimitTags.length === 1) {
				parser.limit = parseInt(rowLimitTags[0].childNodes[0].nodeValue);
			}
			return parser;
		};
		CamlParser.prototype.__parseWhere = function(tag, parentObject) {
			var parser = this;
			var obj = {};
			if (tag.nodeName === 'Where') {
				var node = tag.childNodes[0];
				obj.operator = node.nodeName;
				obj.column = node.getElementsByTagName('FieldRef')[0].attributes.Name.value;
				obj.value = node.getElementsByTagName('Value')[0].childNodes[0].nodeValue;
			}else if (tag.nodeName === 'And' || tag.nodeName === 'Or') {
				obj.concat = tag.nodeName;
				obj.queries = [];
				for (var i = 0; i < tag.childNodes.length; i++) {
					parser.__parseWhere(tag.childNodes[i], obj.queries);					
				}
			}
			if (Array.isArray(parentObject)) {
				parentObject.push(obj);
			}else {
				Object.getOwnPropertyNames(obj).forEach(function(param) {
					parentObject[param] = obj[param];
				});
			}
		};
		CamlParser.prototype.getViewFields = function() {
			return this.viewFields;
		};
		CamlParser.prototype.hasViewFields = function() {
			return this.viewFields.length > 0;
		};
		CamlParser.prototype.getWhere = function() {
			return this.where;
		};
		CamlParser.prototype.hasWhere = function() {
			return (this.where !== null && this.where !== undefined && Object.getOwnPropertyNames(this.where) > 0);
		};
		CamlParser.prototype.getLimit = function() {
			return this.limit;
		};
		CamlParser.prototype.hasLimit = function() {
			return (this.limit !== null && this.limit !== undefined && !isNaN(this.limit) && this.limit >= 0);
		};
		CamlParser.prototype.getQuery = function() {
			return this.query;
		};
		return ({
			parse: function(query) {
				return new CamlParser(query);
			}
		});
	});
angular
	.module('ngSharepoint')
	.factory('CamlBuilder', ['CamlTag', function(CamlTag) {
		var CamlBuilder = function() {
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
				if (caml.name === name) {
					result.push(caml);
				}
			});
			return result;
		};
		CamlBuilder.prototype.build = function() {
			for (var i = 0; i < this.caml.length; i++) {
				this.caml[i] = this.caml[i].build();
			}
			return this.caml.join('');
		};
		return (CamlBuilder);
	}]);
angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(name, attr, value) {
			this.name = name;
			this.attr = attr || {};
			this.value = value;
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
		CamlTag.prototype.push = function(tag, attr, value) {
			var camlTag;
			if (tag instanceof CamlTag) {
				camlTag = tag;
			}else {
				camlTag = new CamlTag(tag, attr, value);
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
	.provider('$spLog', function() {
		var prefix = "[ngSharepoint] ";
		var enabled = true;
		return {
			setPrefix: function(prefix) {
				this.prefix = "[" + prefix + "] ";
			},
			setEnabled: function(enabled) {
				this.enabled = enabled;
			},
			$get: function() {
				return ({
					error: function(msg) {
						if (enabled) {
							if (typeof msg === "object") {
								console.error(prefix + "Object: %O", msg);
							}else {
								console.error(prefix + msg);
							}
						}
					},
					warn: function(msg) {
						if (enabled) {
							if (typeof msg === "object") {
								console.warn(prefix + "Object: %O", msg);
							}else {
								console.warn(prefix + msg);
							}
						}
					},
					log: function(msg) {
						if (enabled) {
							if (typeof msg === "object") {
								console.log(prefix + "Object: %O", msg);
							}else {
								console.log(prefix + msg);
							}
						}
					}
				});
			}
		};
	});
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
				if (connMode === "JSOM" || connMode === "REST") {
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
	.module('ngSharepoint.Lists', ['ngSharepoint']);
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
	.factory('DeleteQuery', ['$spList', 'CamlBuilder', 'WhereQuery', 'Query', function($spList, CamlBuilder, WhereQuery, Query) {
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
            return $spList.getList(this.__list).delete(camlBuilder.build());
        };
        return (DeleteQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
	.factory('InsertIntoQuery', ['$spList', 'Query', function($spList, Query) {
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
            return $spList.getList(this.__list).insert(this.__values);
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
            if (value !== null && value !== undefined && typeof value === 'string') {
                return value.trim();
            }else {
                return value;
            }
        };
		return (Query);
	});
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
angular
	.module('ngSharepoint.Lists')
	.factory('UpdateQuery', ['$spList', 'CamlBuilder', 'WhereQuery', 'Query', function($spList, CamlBuilder, WhereQuery, Query) {
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
            return $spList.getList(this.__list).update(camlBuilder.build(), this.__values);
        };
        return (UpdateQuery);
	}]);
angular
	.module('ngSharepoint.Lists')
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
            if (typeof field === "string") {
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
    }])
    .factory('SPList', ['$q', '$http', '$sp', '$spLog', '$spCamlParser', function($q, $http, $sp, $spLog, $spCamlParser) {
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
        if ($sp.getConnectionMode() === "JSOM") {
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
      //RestSPList
      var RestSPList = function(title) {
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
      RestSPList.prototype.insert = function(data) {
        var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/items";
        var body = {
          __metadata: {
            type: 'SP.Data.TestListItem'
          }
        };
        var headers = {
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "Accept": "application/json; odata=verbose",
          "Content-Type": "application/json; odata=verbose"
        };
        Object.getOwnPropertyNames(data).forEach(function(key) {
          var value = data[key];
          if (value !== null && value !== undefined && typeof value === 'string') {
            value = value.trim();
          }
          body[key] = value;
        });
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
      RestSPList.prototype.delete = function(query) {
        //TODO: Implement
      };
      RestSPList.prototype.update = function(query, data) {
        //TODO: Implement
      };
      //JsomSPList
      var JsomSPList = function(title) {
        this.title = title;
      };
      JsomSPList.prototype.select = function(query) {
        var that = this;
        return $q(function(resolve, reject) {
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
              result.push(list.__unpack(item, $spCamlParser.parse(query).getViewFields()));
            }
            resolve(result);
          }, function(sender, args) {
            reject(args);
          });
        });
      };
      JsomSPList.prototype.insert = function(data) {
        var that = this;
        return $q(function(resolve, reject) {
          var clientContext = $sp.getContext();
          var list = clientContext.get_web().get_lists().getByTitle(that.title);
          var itemInfo = new SP.ListItemCreationInformation();
          var item = list.addItem(itemInfo);
          list.__pack(item, data);
          item.update();
          clientContext.load(item);
          clientContext.executeQueryAsync(function(sender, args) {
              resolve(data);
          }, function(sender, args) {
              reject(args);
          });
        });
      };
      JsomSPList.prototype.delete = function(query) {
        var that = this;
        return $q(function(resolve, reject) {
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
      };
      JsomSPList.prototype.update = function(query, data) {
        var list = this;
        return $q(function(resolve, reject) {
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
              list.__pack(item, data);
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
      return (SPList);
    }]);

angular
  .module('ngSharepoint.Users', ['ngSharepoint']);

angular
	.module('ngSharepoint.Users')
	.directive('spUser', ['$spUser', function($spUser) {
		return {
			restrict: 'E',
			scope: {
				'name': '@'
			},
			transclude: true,
			template: '<div ng-transclude></div>',
			link: function(scope, element, attrs) {
				scope.$watch(attrs.name, function(value) {
					$spUser.getUser(value).then(function(user) {
						scope.user = user;
					});
				});
			}
		};
	}]);
angular
	.module('ngSharepoint.Users')
	.factory('SPUser', ['$q', '$http', '$sp', function($q, $http, $sp) {
		var SPUser = function(accountName, load) {
			var user = this;
			if (angular.isUndefined(load)) {
				load = true;
			}
			user.accountName = accountName;
			if ($sp.getConnectionMode() === "JSOM") {
				user.__list = new JsomSPUser(accountName);
			}else {
				user.__list = new RestSPUser(accountName);
			}
			if (load) {
				return $q(function(resolve, reject) {
					user.load().then(function(data) {
						user.displayName = data.displayName;
						user.email = data.email;
						user.picture = data.picture;
						user.title = data.title;
						user.personalUrl = data.personalUrl;
						user.userUrl = data.userUrl;
						user.properties = data.properties;
					}).then(resolve, reject);
				});
			}else {
				return user;
			}
		};
		SPUser.prototype.load = function() {
			return this.__list.load();
		};
		var JsomSPUser = function(accountName) {
			this.accountName = accountName;
		};
		JsomSPUser.prototype.load = function() {
			var user = this;
			return $q(function(resolve, reject) {
				var context = $sp.getContext();
				var peopleManager = new SP.UserProfiles.PeopleManager(context);
				var properties = peopleManager.getPropertiesFor(user.accountName);
				context.load(properties);
				context.executeQueryAsync(function() {
					var data = {};
					data.displayName = properties.get_displayName();
					data.email = properties.get_email();
					data.picture = properties.get_pictureUrl();
					data.title = properties.get_title();
					data.personalUrl = properties.get_personalUrl();
					data.userUrl = properties.get_userUrl();
					resolve(data);
				}, reject);
			});
		};
		var RestSPUser = function(accountName) {
			this.accountName = accountName;
		};
		RestSPUser.prototype.load = function() {
			var user = this;
			var endpoint = "_api/SP.UserProfiles.PeopleManager/getPropertiesFor(@account)?@account='" + user.accountName + "'";
			var headers = {
				"X-RequestDigest": $("#__REQUESTDIGEST").val(),
          		"Accept": "application/json; odata=verbose",
          		"Content-Type": "application/json; odata=verbose"
			};
			return $q(function(resolve, reject) {
				$http({
					method: 'GET',
					url: $sp.getSiteUrl() + endpoint,
					headers: headers
				}).then(function(response) {
					var data = {};
					data.displayName = response.d.DisplayName;
					data.email = response.d.Email;
					data.picture = response.d.PictureUrl;
					data.title = response.d.Title;
					data.personalUrl = response.d.PersonalUrl;
					data.userUrl = response.d.UserUrl;
					resolve(data);
				}, reject);
			});
		};
	}]);
angular
    .module('ngSharepoint.Users')
    .provider('$spUser', ['$q', '$sp', 'SPUser', function ($q, $sp, SPUser) {
        return {
            $get: ['$q', '$sp', function($q, $sp) {
                return({
                    getCurrentUser: function() {
                        //TODO: Abstract with SPUser
                        return $q(function(resolve, reject) {
                            var context = $sp.getContext();
                            var peopleManager = new SP.UserProfiles.PeopleManager(context);
                            var properties = peopleManager.getMyProperties();
                            context.load(properties);
                            context.executeQueryAsync(function() {
                                resolve(properties);
                            }, reject);
                        });
                    },
                    getUser: function(accountName) {
                        return new SPUser(accountName);
                    }
                });
            }]
        };
    }]);