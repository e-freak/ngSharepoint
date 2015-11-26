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
                            var list = listEnumerator.get_current();
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
            this.title = title; //TODO: Get by GUID
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
        JsomSPList.prototype.getTitle = function() {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    context.load(list);
                    context.executeQueryAsync(function() {
                        resolve(list.get_title());
                    }, reject);
                }, reject);
            });
        };
        JsomSPList.prototype.setTitle = function(title) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.list);
                    list.set_title(title);
                    list.update();
                    context.executeQueryAsync(function() {
                        that.title = title;
                        resolve();
                    }, reject);
                }, reject);
            });
        };
        JsomSPList.prototype.getDescription = function() {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    context.load(list);
                    context.executeQueryAsync(function() {
                        resolve(list.get_description());
                    }, reject);
                }, reject);
            });
        };
        JsomSPList.prototype.setDescription = function(desc) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.list);
                    list.set_description(desc);
                    list.update();
                    context.executeQueryAsync(resolve, reject);
                }, reject);
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
                                if (field.get_title() !== 'BDC Identity') { //TODO: Make configurable
                                    columns.push(field.get_title());
                                }
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
            var endpoint = '_api/web/Lists/GetByTitle(\'' + this.title + '\')/Items';
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
                }, reject);
            });
        };
        RestSPList.prototype.delete = function(query) {
        };
        RestSPList.prototype.update = function(query, data) {
        };
        return (RestSPList);
    }]);

angular
    .module('ngSharepoint.Lists')
    .factory('SPList', ['$sp', '$spLog', 'CamlBuilder', 'RestSPList', 'JsomSPList', function($sp, $spLog, CamlBuilder, RestSPList, JsomSPList) {
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
        SPList.prototype.create = function(data, serializer) {
            return this.__list.create(data, serializer).catch($spLog.error);
        };
        SPList.prototype.read = function(query, serializer) {
            return this.__list.read(query, serializer).catch($spLog.error);
        };
        SPList.prototype.update = function(query, data, serializer) {
            return this.__list.update(query, data, serializer).catch($spLog.error);
        };
        SPList.prototype.delete = function(query) {
            return this.__list.delete(query).catch($spLog.error);
        };
        SPList.prototype.query = function(query) {
            if (angular.isObject(query)) {
                return this.__jsonQuery(query);
            }
        };
        SPList.prototype.__jsonQuery = function(query) {
            if (angular.isDefined(query.type)) {
                var builder = new CamlBuilder();
                builder.buildFromJson(query);
                var caml;
                if (!builder.isEmpty()) {
                    caml = builder.build();
                }
                switch (query.type) {
                    case 'create':
                        if (angular.isDefined(query.data)) {
                            return this.create(query.data, query.serializer);
                        }else {
                            throw 'Query Data is not defined';
                        }
                        break;
                    case 'read':
                        return this.read(caml, query.serializer);
                    case 'update':
                        if (angular.isDefined(query.data)) {
                            return this.update(caml, query.data, query.serializer);
                        }else {
                            throw 'Query Data is not defined';
                        }
                        break;
                    case 'delete':
                        return this.delete(caml);
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

function $query($spList, $spLog) {
    var Query = function() {
        this.list = undefined;
        this.__columns = [];
        this.__type = undefined;
        this.__query = undefined;
        this.__limit = undefined;
        this.__serializer = undefined;
        this.__order = [];
        this.__data = {};
        this.read = function(cols) {
            if (angular.isUndefined(this.__type)) {
                this.__columns = cols;
                this.__type = 'read';
            }else {
                throw 'Cannot use read after another query type was selected';
            }
            return this;
        };
        this.create = function(data) {
            if (angular.isUndefined(this.__type)) {
                this.__type = 'create';
                if (angular.isDefined(data)) {
                    this.__data = data;
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
            if (angular.isUndefined(this.__type)) {
                this.__type = 'update';
                if (angular.isDefined(data)) {
                    this.__data = data;
                }
            }else {
                throw 'Cannot use update after another query type was selected';
            }
            return this;
        };
        this.delete = function() {
            if (angular.isUndefined(this.__type)) {
                this.__type = 'delete';
            }else {
                throw 'Cannot use delete after another query type was selected';
            }
            return this;
        };
        this.where = function(col) {
            if (angular.isDefined(this.__type) && this.__type === 'create') {
                $spLog.warn('where call is not necessary while creating entries');
            }
            var Where = function(col, instance) {
                var that = this;
                var comparators = [
                    'beginsWith',
                    'contains',
                    'dateRangesOverlap',
                    'eq',
                    'equals',
                    'geq',
                    'greaterEquals',
                    'greater',
                    'in',
                    'includes',
                    'isNotNull',
                    'isNull',
                    'leq',
                    'lessEquals',
                    'less',
                    'neq',
                    'notEquals',
                    'notIncludes'];
                comparators.forEach(function(comparator) {
                    that[comparator] = function(value) {
                        instance.__query = {
                            comparator: comparator.toLowerCase(),
                            column: col
                        };
                        if (angular.isDefined(value)) {
                            instance.__query['value'] = value;
                        }
                        return instance;
                    };
                });
            };
            return new Where(col, this);
        };
        this.set = function(column, value) {
            if (angular.isDefined(this.__type) &&
                this.__type !== 'create' &&
                this.__type !== 'update') {
                $spLog.warn('set call is not necessary while reading/deleting entries');
            }
            this.__data[column] = value;
            return this;
        };
        this.value = function(column, value) {
            if (angular.isDefined(this.__type) &&
                this.__type !== 'create' &&
                this.__type !== 'update') {
                $spLog.warn('value call is not necessary while reading/deleting entries');
            }
            this.__data[column] = value;
            return this;
        };
        this.class = function(serializer) {
            if (angular.isDefined(this.__type) && this.__type === 'delete') {
                $spLog.warn('class call is not necessary while deleting entries');
            }
            this.__serializer = serializer;
            return this;
        };
        this.orderBy = function(field, asc) {
            if (angular.isDefined(this.__type) && this.__type !== 'read') {
                $spLog.warn('orderBy call is not necessary while reading entries');
            }
            if (angular.isUndefined(asc)) {
                asc = true;
            }
            this.__order.push({column: field, asc: asc});
            return this;
        };
        this.limit = function(limit) {
            this.__limit = limit;
            return this;
        };
        this.exec = function() {
            if (angular.isDefined(this.list) && angular.isString(this.list)) {
                var query = {};
                if (angular.isDefined(this.__type)) {
                    query.type = this.__type;
                }else {
                    throw 'No Query Type specified';
                }
                if (angular.isDefined(this.__columns) &&
                    angular.isArray(this.__columns) &&
                    this.__columns.length > 0) {
                    query.columns = this.__columns;
                }
                if (angular.isDefined(this.__query)) {
                    query.query = this.__query;
                }
                if (angular.isDefined(this.__limit)) {
                    query.limit = this.__limit;
                }
                if (angular.isDefined(this.__serializer)) {
                    query.serializer = this.__serializer;
                }
                if (angular.isDefined(this.__order) &&
                    angular.isArray(this.__order) &&
                    this.__order.length > 0) {
                    query.order = this.__order;
                }
                if (angular.isDefined(this.__data) &&
                    angular.isObject(this.__data) &&
                    Object.getOwnPropertyNames(this.__data).length > 0) {
                    query.data = this.__data;
                }
                return $spList.getList(this.list).query(query);
            }else {
                throw 'No List specified';
            }
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
$query.$inject = ['$spList', '$spLog'];

describe('The $query Service', function() {
    var $query;
    var mock;
    var spList;
    var log;
    beforeEach(module('ngSharepoint.Lists'));
    beforeEach(function() {
        spList = {
            query: jasmine.createSpy()
        };
        mock = {
            getList: function() {
                return spList;
            }
        };
        spyOn(mock, 'getList').and.callThrough();
        module(function($provide) {
            $provide.value('$spList', mock);
        });
        inject(function($injector) {
            $query = $injector.get('$query');
            log = $injector.get('$spLog');
            spyOn(log, 'error');
            spyOn(log, 'warn');
            spyOn(log, 'log');
        });
    });
    it('reads from a list', function() {
        $query.read().from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read'});
    });
    it('reads only specific columns from a list', function() {
        $query.read(['Column1']).from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', columns: ['Column1']});
    });
    describe('reads only specific rows from a list', function() {
        it('where fields begin with', function() {
            $query.read().from('List').where('Column1').beginsWith('Te').exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'beginswith', column: 'Column1', value: 'Te'}});
        });
        it('where fields contain', function() {
            $query.read().from('List').where('Column1').contains('es').exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'contains', column: 'Column1', value: 'es'}});
        });
        it('where fields date ranges overlap', function() {
            var date = new Date();
            $query.read().from('List').where('Column1').dateRangesOverlap(date).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'daterangesoverlap', column: 'Column1', value: date}});
        });
        it('where fields are equal', function() {
            $query.read().from('List').where('Column1').equals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'equals', column: 'Column1', value: 4}});
        });
        it('where fields are greater equal', function() {
            $query.read().from('List').where('Column1').greaterEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'greaterequals', column: 'Column1', value: 4}});
        });
        it('where fields are greater', function() {
            $query.read().from('List').where('Column1').greater(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'greater', column: 'Column1', value: 4}});
        });
        it('where fields are in', function() {
            $query.read().from('List').where('Column1').in(['Value']).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'in', column: 'Column1', value: ['Value']}});
        });
        it('where fields include', function() {
            $query.read().from('List').where('Column1').includes(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'includes', column: 'Column1', value: 4}});
        });
        it('where fields are not null', function() {
            $query.read().from('List').where('Column1').isNotNull().exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'isnotnull', column: 'Column1'}});
        });
        it('where fields are null', function() {
            $query.read().from('List').where('Column1').isNull().exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'isnull', column: 'Column1'}});
        });
        it('where fields are less equal', function() {
            $query.read().from('List').where('Column1').lessEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'lessequals', column: 'Column1', value: 4}});
        });
        it('where fields are less', function() {
            $query.read().from('List').where('Column1').less(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'less', column: 'Column1', value: 4}});            
        });
        it('where fields do not equal', function() {
            $query.read().from('List').where('Column1').notEquals(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'notequals', column: 'Column1', value: 4}});            
        });
        it('where fields do not include', function() {
            $query.read().from('List').where('Column1').notIncludes(4).exec();
            expect(mock.getList).toHaveBeenCalledWith('List');
            expect(spList.query).toHaveBeenCalledWith({type: 'read', query: {comparator: 'notincludes', column: 'Column1', value: 4}});            
        });
    });
    it('reads only a certain amount of rows', function() {
        $query.read().from('List').limit(42).exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', limit: 42});
    });
    it('reads from a list in a specific order', function() {
        $query.read().from('List').orderBy('Column1').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read', order: [{column: 'Column1', asc: true}]});
    });
    it('throws an exception when not specifying a list', function() {
        expect(function() {
            $query.read().exec();
        }).toThrow('No List specified');
    });
    it('can not execute read after another query', function() {
        expect(function() {
            $query.create({Data: 'Value'}).in('List').read().exec();
        }).toThrow('Cannot use read after another query type was selected');
    });
    it('selects all columns when specifying an empty list', function() {
        $query.read([]).from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'read'});
    });
    it('creates a row in a list', function() {
        $query.create({Data: 'Value'}).in('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('creates a row in a list', function() {
        $query.create().in('List').set('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('creates a row in a list', function() {
        $query.create().in('List').value('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}});
    });
    it('warns when calling where while creating a row', function() {
        $query.create({Data: 'Value'}).in('List').where('Data').equals('Value').exec();
        expect(log.warn).toHaveBeenCalledWith('where call is not necessary while creating entries');
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'create', data: {Data: 'Value'}, query: {comparator: 'equals', column: 'Data', value: 'Value'}});
    });
    it('can not execute read after another query', function() {
        expect(function() {
            $query.read().from('List').create({Data: 'Value'}).exec();
        }).toThrow('Cannot use create after another query type was selected');
    });
    it('updates all rows in a list', function() {
        $query.update({Data: 'Value'}).in('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'update', data: {Data: 'Value'}});
    });
    it('updates all rows in a list', function() {
        $query.update().in('List').set('Data', 'Value').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'update', data: {Data: 'Value'}});
    });
    it('can not execute update after another query', function() {
        expect(function() {
            $query.read().from('List').update({Data: 'Value'}).exec();
        }).toThrow('Cannot use update after another query type was selected');
    });
    it('deletes all rows from a list', function() {
        $query.delete().from('List').exec();
        expect(mock.getList).toHaveBeenCalledWith('List');
        expect(spList.query).toHaveBeenCalledWith({type: 'delete'});
    });
    it('can not execute delete after another query', function() {
        expect(function() {
            $query.create({Data: 'Value'}).in('List').delete().exec();
        }).toThrow('Cannot use delete after another query type was selected');
    });
});
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
