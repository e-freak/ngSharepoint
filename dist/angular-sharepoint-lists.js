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
                    context.executeQueryAsync(function() {
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
        JsomSPList.prototype.getGUID = function() {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    context.load(list);
                    context.executeQueryAsync(function() {
                        resolve(list.get_id().toString());
                    }, reject);
                });
            });
        };
        JsomSPList.prototype.readColumns = function(query) {
            var that = this;
            return $q(function(resolve, reject) {
                var columns = $spCamlParser.parse(query).getViewFields();
                if (columns.length <= 0) {
                    $spLoader.waitUntil('SP.Core').then(function() {
                        var context = $sp.getContext();
                        var list = context.get_web().get_lists().getByTitle(that.title);
                        var fields = list.get_fields();
                        context.load(fields, 'Include(Title)');
                        context.executeQueryAsync(function() {
                            var itemIterator = fields.getEnumerator();
                            while (itemIterator.moveNext()) {
                                var field = itemIterator.get_current();
                                columns.push(field.get_title());
                            }
                            resolve(columns);
                        }, reject);
                    }, reject);
                }else {
                    resolve(columns);
                }
            });
        };
        JsomSPList.prototype.read = function(query, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                that.readColumns(query).then(function(columns) {
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
                                result.push(that.__unpack(item, columns, serializer));
                            }
                            resolve(result);
                        }, function(sender, args) {
                            reject(args);
                        });
                    }, reject);
                });
            });
        };
        JsomSPList.prototype.create = function(data, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var itemInfo = new SP.ListItemCreationInformation();
                    var item = list.addItem(itemInfo);
                    that.__pack(item, data, serializer);
                    item.update();
                    clientContext.load(item);
                    clientContext.executeQueryAsync(function() {
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
                    clientContext.executeQueryAsync(function() {
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
                    });
                });
            });
        };
        JsomSPList.prototype.update = function(query, data, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
                    var items = list.getItems(camlQuery);
                    clientContext.load(items);
                    clientContext.executeQueryAsync(function() {
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                            var item = itemIterator.get_current();
                            that.__pack(item, data, serializer);
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
        JsomSPList.prototype.__pack = function(item, data, serializer) {
            if (angular.isDefined(serializer)) {
                data = serializer.__serialize();
            }
            Object.getOwnPropertyNames(data).forEach(function(key) {
                var value = data[key];
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
                    value = value.trim();
                }
                item.set_item(key, value);
            });
        };
        JsomSPList.prototype.__unpack = function(item, cols, serializer) {
            var obj = {};
            if (!angular.isArray(cols)) {
                cols = Object.getOwnPropertyNames(cols);
            }
            cols.forEach(function(key) {
                var value = item.get_item(key);
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
                    value = value.trim();
                }
                obj[key] = value;
            });
            if (angular.isDefined(serializer)) {
                return serializer.__deserialize(obj);
            }
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
        //TODO: Add all List APIs
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

        SPList.prototype.getGUID = function() {
            return this.__list.getGUID().catch($spLog.error);
        };

        SPList.prototype.getTitle = function() {
            return this.__list.getTitle().catch($spLog.error);
        };

        SPList.prototype.setTitle = function(title) {
            return this.__list.setTitle(title).catch($spLog.error);
        };

        SPList.prototype.getDescription = function() {
            return this.__list.getDescription().catch($spLog.error);
        };

        SPList.prototype.setDescription = function(desc) {
            return this.__list.setDescription(desc).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @name  SPList#create
        * @param  {object} data The Data you wanna create
        * @return {Promise}      A Promise which resolves when the insertion was sucessful
        */
        SPList.prototype.create = function(data, serializer) {
            return this.__list.create(data, serializer).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @name  SPList#read
        * @param {string} query A CamlQuery to filter for
        * @return {Promise} A Promise which resolves to the selected data
        */
        SPList.prototype.read = function(query, serializer) {
            return this.__list.read(query, serializer).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @param  {string} query  A CamlQuery which selects the rows to update
        * @param  {object} data The Data you wanna update
        * @return {Promise}        A Promise which resolves when the update was sucessfull
        */
        SPList.prototype.update = function(query, data, serializer) {
            return this.__list.update(query, data, serializer).catch($spLog.error);
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
         * @param  {object} query [description]
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
                            return this.create(query.data, query.serializer);
                        }else {
                            throw 'Query Data is not defined';
                        }
                        break;
                    case 'read':
                        return this.read(builder.build(), query.serializer);
                    case 'update':
                        if (angular.isDefined(query.data)) {
                            return this.update(builder.build(), query.data, query.serializer);
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
    .factory('$query', $query);

function $query($spList) {
    var Query = function() {
        this.columns = [];
        this.list = undefined;
        this.type = undefined;
        this.query = undefined;
        this.limit = undefined;
        this.serializer = undefined;
        this.order = [];
        this.data = {};
        this.read = function(cols) {
            if (angular.isUndefined(this.type)) {
                if (angular.isUndefined(cols)) {
                    cols = '*';
                }
                this.columns = cols;
                this.type = 'read';
            }else {
                throw 'Cannot use read after another query type was selected';
            }
            return this;
        };
        this.create = function(data) {
            if (angular.isUndefined(this.type)) {
                this.type = 'create';
                if (angular.isDefined(data)) {
                    this.data = data;
                }
            }else {
                throw 'Cannot use create after another query type was selected';
            }
            return this;
        };
        this.from = function(list) {
            this.list = list;
            return this;
        };
        this.in = function(list) {
            this.list = list;
            return this;
        };
        this.list = function(list) {
            this.list = list;
            return this;
        };
        this.update = function(data) {
            if (angular.isUndefined(this.type)) {
                this.type = 'update';
                if (angular.isDefined(data)) {
                    this.data = data;
                }
            }else {
                throw 'Cannot use update after another query type was selected';
            }
            return this;
        };
        this.delete = function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'delete';
            }else {
                throw 'Cannot use delete after another query type was selected';
            }
            return this;
        };
        this.where = function(col) {
            var Where = function(col, instance) {
                this.equals = function(value) {
                    instance.query = {
                        comparator: 'equals',
                        column: col,
                        value: value
                    };
                    return instance;
                };
                this.greater = function(value) {
                    instance.query = {
                        comparator: 'greater',
                        column: col,
                        value: value
                    };
                    return instance;
                };
                this.smaller = function(value) {
                    instance.query = {
                        comparator: 'smaller',
                        column: col,
                        value: value
                    };
                    return instance;
                };
            };
            return new Where(col, this);
        };
        this.set = function(column, value) {
            this.data[column] = value;
            return this;
        };
        this.value = function(column, value) {
            this.data[column] = value;
            return this;
        };
        this.class = function(serializer) {
            this.serializer = serializer;
            return this;
        };
        this.orderBy = function(field, asc) {
            if (angular.isUndefined(asc)) {
                asc = true;
            }
            this.order.push({column: field, asc: asc});
            return this;
        };
        this.limit = function(limit) {
            this.limit = limit;
            return this;
        };
        this.exec = function() {
            return $spList.getList(this.list).query(this);
        };
        this.then = function(resolve, reject) {
            return this.exec().then(resolve, reject);
        };
    };
    return ({ //TODO: Reimplement this nested return mess
        'create': function(data) {
            return new Query().create(data);
        },
        'read': function(cols) {
            return new Query().read(cols);
        },
        'update': function(data) {
            return new Query().update(data);
        },
        'delete': function() {
            return new Query().delete();
        }
    });
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
