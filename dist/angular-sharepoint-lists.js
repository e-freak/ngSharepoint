angular
    .module('ngSharepoint.Lists', ['ngSharepoint']);

angular
    .module('ngSharepoint.Lists')
    .factory('JSOMConnector', ['$q', '$sp', function($q, $sp) {
        return ({
            getLists: function() {
                return $q(function(resolve, reject) {
                    var context = $sp.getContext();
                    var lists = context.get_web().get_lists();
                    context.load(lists);
                    context.executeQueryAsync(function(sender, args) {
                        var result = [];
                        var listEnumerator = lists.getEnumerator();
                        while (listEnumerator.moveNext()) {
                            var list = lists.get_current();
                            result.push(list);
                        }
                        resolve(result);
                    }, reject);
                });
            }
        });
    }]);

angular
    .module('ngSharepoint.Lists')
    .factory('RESTConnector', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
        return ({
            getLists: function() {
                return $q(function(resolve, reject) {

                });
            }
        });
    }]);

angular
    .module('ngSharepoint.Lists')
    .factory('JsomSPList', ['$q', '$sp', '$spLoader', '$spCamlParser', function($q, $sp, $spLoader, $spCamlParser) {
        var JsomSPList = function(title) {
            this.title = title;
        };
        JsomSPList.prototype.read = function(query) {
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
        JsomSPList.prototype.create = function(data) {
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
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.__list);
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
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
                    value = value.trim();
                }
                item.set_item(key, value);
            });
        };
        JsomSPList.prototype.__unpack = function(item, fields) {
            var query = this;
            var obj = {};
            var cols = fields;
            if (!angular.isArray(fields)) {
                cols = Object.getOwnPropertyNames(fields);
            }
            cols.forEach(function(key) {
                var value = item.get_item(key);
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
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
        RestSPList.prototype.read = function(query) {
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
        RestSPList.prototype.create = function(data) {
            var endpoint = '_api/web/Lists/GetByTitle(\'' + this.title + '\')/items';
            var body = {
                __metadata: {
                    type: 'SP.Data.TestListItem'
                }
            };
            Object.getOwnPropertyNames(data).forEach(function(key) {
                var value = data[key];
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
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
    .factory('SPList', ['$sp', '$spLog', 'CamlBuilder', 'RestSPList', 'JsomSPList', function($sp, $spLog, CamlBuilder, RestSPList, JsomSPList) {
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
        * @name  SPList#create
        * @param  {object} data The Data you wanna create
        * @return {Promise}      A Promise which resolves when the insertion was sucessful
        */
        SPList.prototype.create = function(data) {
            return this.__list.create(data).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @name  SPList#read
        * @param {string} query A CamlQuery to filter for
        * @return {Promise} A Promise which resolves to the selected data
        */
        SPList.prototype.read = function(query) {
            return this.__list.read(query).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @param  {string} query  A CamlQuery which selects the rows to update
        * @param  {object} data The Data you wanna update
        * @return {Promise}        A Promise which resolves when the update was sucessfull
        */
        SPList.prototype.update = function(query, data) {
            return this.__list.update(query, data).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @param  {string} query A CamlQuery to filter for
        * @return {Promise}       [description]
        */
        SPList.prototype.delete = function(query) {
            return this.__list.delete(query).catch($spLog.error);
        };
        /**
         * @ngdoc function
         * @param  {[type]} query [description]
         * @return {Promise}       [description]
         */
        SPList.prototype.query = function(query) {
            if (angular.isObject(query)) {
                return this.__jsonQuery(query);
            }
        };
        SPList.prototype.__jsonQuery = function(query) {
            if (angular.isDefined(query.type)) {
                var builder = new CamlBuilder();
                builder.buildFromJson(query);
                switch (query.type) {
                    case 'create':
                        if (angular.isDefined(query.data)) {
                            return this.create(query.data);
                        }else {
                            throw 'Query Data is not defined';
                        }
                        break;
                    case 'read':
                        return this.read(builder.build());
                    case 'update':
                        if (angular.isDefined(query.data)) {
                            return this.update(builder.build(), query.data);
                        }else {
                            throw 'Query Data is not defined';
                        }
                        break;
                    case 'delete':
                        return this.delete(builder.build());
                }
            }else {
                throw 'Query Type is not defined';
            }
        };
        return (SPList);
    }]);

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
            this.__order = [];
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
            this.__order.push({column: field, asc: asc});
            return this;
        };
        SelectQuery.prototype.exec = function() {
            var builder = new CamlBuilder();
            var query = {};
            if (angular.isObject(this.__values)) {
                query.columns = this.__values;
            }
            if (angular.isDefined(this.__limit)) {
                query.limit = this.__limit;
            }
            if (angular.isDefined(this.__order)) {
                query.order = this.__order;
            }
            builder.buildFromJson(query);
            return new SPList(this.__list).read(builder.build());
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
            if (angular.isString(field)) {
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
    .factory('$query', $query);

function $query($spList) {
    var Query = {
        'columns': [],
        'list': undefined,
        'type': undefined,
        'select': function(cols) {
            if (angular.isUndefined(this.type)) {
                if (angular.isUndefined(cols)) {
                    cols = '*';
                }
                this.columns = cols;
                this.type = 'read';
            }else {
                throw 'Cannot use select after another query type was selected';
            }
        },
        'from': function(list) {
            this.list = list;
        },
        'insert': function(data) {
            if (angular.isUndefined(this.type)) {
                if (angular.isUndefined(data)) {
                    this.data = data;
                    this.type = 'create';
                }else {
                    throw 'No Data';
                }
            }else {
                throw 'Cannot use insert after another query type was selected';
            }
        },
        'into': function(list) {
            this.list = list;
        },
        'update': function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'update';
            }else {
                throw 'Cannot use update after another query type was selected';
            }
        },
        'delete': function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'delete';
            }else {
                throw 'Cannot use delete after another query type was selected';
            }        },
        'where': function() {},
        'exec': function() {
            return $spList.getList(this.list).query(this);
        },
        'then': function(resolve, reject) {
            return this.exec().then(resolve, reject);
        }
    };

    var query = new Query();
    var service = {
        'select': query.select,
        'insert': query.insert,
        'update': query.update,
        'delete': query.delete
    };
    return service;
}
$query.$inject = ['$spList'];

angular
    .module('ngSharepoint.Lists')
    .factory('$spList', $spList);

function $spList ($sp, SPList, JSOMConnector, RESTConnector) {
    var service = {
        getList: getList,
        getLists: getLists
    };

    return service;

    function getList(title) {
        return new SPList(title);
    }
    function getLists() {
        var promise;
        if ($sp.getConnectionMode() === 'JSOM') {
            promise = JSOMConnector.getLists();
        }else {
            promise = RESTConnector.getLists();
        }
        return promise.then(function(listNames) {
            var lists = [];
            listNames.forEach(function(name) {
                lists.push(new SPList(name));
            });
            return lists;
        });
    }
}
$spList.$inject = ['$sp', 'SPList', 'JSOMConnector', 'RESTConnector'];
