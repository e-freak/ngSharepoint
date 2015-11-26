angular
    .module('ngSharepoint', [])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                var scripts = [
                    '//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js',
                    'SP.Runtime.js',
                    'SP.js'
                ];
                $spLoader.loadScripts('SP.Core', scripts);
            }else if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken()) {
                $spLoader.loadScript('SP.RequestExecutor.js');
            }
        }
    }]);

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
            this.caml.forEach(function(tag) {
                if (tag.name === name) {
                    result.push(tag);
                }
            });
            return result;
        };
        CamlBuilder.prototype.isEmpty = function() {
            if (this.caml.length === 0) {
                return true;
            }else if (this.caml.length === 1) {
                var tag = this.caml[0];
                if (angular.isDefined(tag.value)) {
                    return false;
                }
                if (angular.isDefined(tag.caml) &&
                    angular.isArray(tag.caml) &&
                    tag.caml.length > 0) {
                    return false;
                }
                if (angular.isDefined(tag.attr) &&
                    angular.isObject(tag.attr) &&
                    Object.getOwnPropertyNames(tag.attr).length > 0) {
                    return false;
                }
                return true;
            }else {
                return false;
            }
        };
        CamlBuilder.prototype.build = function() {
            for (var i = 0; i < this.caml.length; i++) {
                this.caml[i] = this.caml[i].build();
            }
            return this.caml.join('');
        };
        CamlBuilder.prototype.buildFromJson = function(json) {
            if (angular.isDefined(json) && angular.isObject(json)) {
                var root = this.findByName('View');
                if (root.length === 0) {
                    root = this.push('View');
                }else {
                    root = root[0];
                }
                if (angular.isDefined(json.columns)) {
                    this.__buildViewFields(json.columns, root);
                }
                if (angular.isDefined(json.query)) {
                    this.__buildQuery(json.query, root);
                }
                if (angular.isDefined(json.limit)) {
                    this.__buildLimit(json.limit, root);
                }
                if (angular.isDefined(json.order) && json.order.length > 0) {
                    this.__buildOrder(json.order, root);
                }
            }
        };
        CamlBuilder.prototype.__buildViewFields = function(columns, root) {
            var viewFields = root.push('ViewFields');
            columns.forEach(function(col) {
                viewFields.push('FieldRef', {Name: col});
            });
        };
        CamlBuilder.prototype.__buildQuery = function(query, root) {
            var builder = this;
            if (root.name === 'View') {
                root = root.push('Query').push('Where');
            }
            if (angular.isDefined(query.concat)) {
                var concatenator;
                if (query.concat === 'and') {
                    concatenator = root.push('And');
                }else if (query.concat === 'or') {
                    concatenator = root.push('Or');
                }else {
                    throw 'Invalid Query';
                }
                query.queries.forEach(function(sub) {
                    builder.__buildQuery(sub, concatenator);
                });
            }else if (angular.isDefined(query.comparator)) {
                query.comparator = query.comparator.toLowerCase();
                var comparator;
                switch (query.comparator) {
                    case 'beginswith':
                        comparator = root.push('BeginsWith');
                        break;
                    case 'contains':
                        comparator = root.push('Contains');
                        break;
                    case 'daterangesoverlap':
                        comparator = root.push('DateRangesOverlap');
                        break;
                    case '==':
                    case 'eq':
                    case 'equals':
                        comparator = root.push('Eq');
                        break;
                    case '>=':
                    case 'geq':
                    case 'greaterequals':
                        comparator = root.push('Geq');
                        break;
                    case '>':
                    case 'gt':
                    case 'greater':
                        comparator = root.push('Gt');
                        break;
                    case 'in':
                        comparator = root.push('In');
                        break;
                    case 'includes':
                        comparator = root.push('Includes');
                        break;
                    case 'isnotnull':
                        comparator = root.push('IsNotNull');
                        break;
                    case 'isnull':
                        comparator = root.push('IsNull');
                        break;
                    case '<=':
                    case 'leq':
                    case 'lessequals':
                        comparator = root.push('Leq');
                        break;
                    case '<':
                    case 'lt':
                    case 'less':
                        comparator = root.push('Lt');
                        break;
                    case '!=':
                    case 'neq':
                    case 'notequals':
                        comparator = root.push('Neq');
                        break;
                    case 'notincludes':
                        comparator = root.push('NotIncludes');
                        break;
                }
                comparator.push('FieldRef', {Name: query.column});
                if (angular.isDefined(query.value)) {
                    comparator.push('Value', {}, query.value);
                }
            }else {
                throw 'Invalid Query';
            }
        };
        CamlBuilder.prototype.__buildLimit = function(limit, root) {
            root.push('RowLimit', {}, limit);
        };
        CamlBuilder.prototype.__buildOrder = function(order, root) {
            var query = root.findByName('Query');
            if (query.length === 0) {
                query = root.push('Query');
            }else {
                query = query[0];
            }
            var orderTag = query.push('OrderBy');
            order.forEach(function(o) {
                if (angular.isDefined(o.column)) {
                    var asc = true;
                    if (angular.isDefined(o.asc)) {
                        asc = o.asc;
                    }
                    asc = asc.toString().toUpperCase();
                    orderTag.push('FieldRef', {Name: o.column, Ascending: asc});
                }else {
                    throw 'Invalid Order Query';
                }
            });
        };
        return (CamlBuilder);
    }]);

angular
    .module('ngSharepoint')
    .factory('$spCamlParser', function() {
        var CamlParser = function(query) {
            var parser = this;
            parser.viewFields = [];
            parser.query = query;
            parser.where = {};
            parser.orderBy = [];
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
                    if (queryNode.nodeName === 'Where' ||
                        queryNode.nodeName === 'And' ||
                        queryNode.nodeName === 'Or') {
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
            if (angular.isArray(parentObject)) {
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
            return (angular.isDefined(this.where) &&
                this.where !== null &&
                Object.getOwnPropertyNames(this.where) > 0);
        };
        CamlParser.prototype.getLimit = function() {
            return this.limit;
        };
        CamlParser.prototype.hasLimit = function() {
            return (angular.isDefined(this.where) &&
                this.limit !== null &&
                !isNaN(this.limit) &&
                this.limit >= 0);
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
        CamlTag.prototype.findByName = function(name) {
            var result = [];
            this.caml.forEach(function(tag) {
                if (tag.name === name) {
                    result.push(tag);
                }
            });
            return result;
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
    .provider('$sp', $spProvider);

function $spProvider() {
    var siteUrl;
    var hostUrl;
    var connMode = 'JSOM';
    var token = false;
    var autoload = true;

    var provider = {
        setSiteUrl: setSiteUrl,
        setHostUrl: setHostUrl,
        setConnectionMode: setConnectionMode,
        setAccessToken: setAccessToken,
        setAutoload: setAutoload,
        $get: $sp
    };
    return provider;

    function setHostUrl(newUrl) {
        if (angular.isDefined(newUrl) && angular.isString(newUrl)) {
            hostUrl = newUrl;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setSiteUrl(newUrl) {
        if (angular.isDefined(newUrl) && angular.isString(newUrl)) {
            siteUrl = newUrl;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setConnectionMode(newConnMode) {
        if (angular.isDefined(newConnMode) && angular.isString(newConnMode)) {
            newConnMode = newConnMode.toUpperCase();
            if (newConnMode === 'JSOM' || newConnMode === 'REST') {
                connMode = newConnMode;
            }else {
                throw 'Invalid Argument Exception';
            }
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setAccessToken(newToken) {
        if (angular.isDefined(newToken) && angular.isString(newToken)) {
            token = newToken;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setAutoload(newAutoload) {
        if (angular.isDefined(newAutoload)) {
            if (newAutoload === true || newAutoload === false) {
                autoload = newAutoload;
            }else {
                throw 'Invalid Argument Exception';
            }
        }else {
            throw 'Invalid Argument Exception';
        }
    }

    function $sp() {
        var service = {
            getSiteUrl: getSiteUrl,
            getHostUrl: getHostUrl,
            getConnectionMode: getConnectionMode,
            getAccessToken: getAccessToken,
            getContext: getContext,
            getAutoload: getAutoload
        };
        return service;

        function getContext() {
            return new SP.ClientContext();
        }
        function getSiteUrl() {
            return siteUrl;
        }
        function getHostUrl() {
            return hostUrl;
        }
        function getConnectionMode() {
            return connMode;
        }
        function getAccessToken() {
            return token;
        }
        function getAutoload() {
            return autoload;
        }
    }
}

angular
    .module('ngSharepoint')
    .factory('$spLoader', ['$q', '$http', '$sp', '$spLog', function($q, $http, $sp, $spLog) {
        var scripts = {};
        var SPLoader = {};
        SPLoader.loadScript = function(lib) {
            var query = $q(function(resolve, reject) {
                var element = document.createElement('script');
                element.type = 'text/javascript';
                if (lib[0] === lib[1] && lib[0] === '/') {
                    element.src = lib;
                }else {
                    element.src = $sp.getSiteUrl() + '_layouts/15/' + lib;
                }
                element.onload = resolve;
                element.onerror = reject;
                document.head.appendChild(element);
            });
            scripts[lib] = query;
            return query;
        };
        SPLoader.loadScripts = function(label, libs) {
            var queries = [];
            libs.forEach(function(lib) {
                queries.push(SPLoader.loadScript(lib));
            });
            var query = $q.all(queries);
            scripts[label] = query;
            return query;
        };
        SPLoader.waitUntil = function(lib) {
            return $q(function(resolve, reject) {
                if (scripts.hasOwnProperty(lib)) {
                    scripts[lib].then(resolve, reject);
                }else if ($sp.getAutoload()) {
                    reject('Library was not requested');
                }else {
                    resolve();
                }
            });
        };
        SPLoader.query = function(queryObject) {
            return $q(function(resolve, reject) {
                var query = {
                    url: $sp.getSiteUrl() + queryObject.url,
                    method: queryObject.method,
                    headers: {
                        'Accept': 'application/json; odata=verbose',
                        'Content-Type': 'application/json; odata=verbose'
                    }
                };
                SPLoader.waitUntil('SP.RequestExecutor.js').then(function() {
                    if (queryObject.hasOwnProperty('data') &&
                        angular.isDefined(queryObject.data) &&
                        queryObject !== null) {
                        query.body = queryObject.data;
                    }
                    query.success = resolve;
                    query.error = reject;
                    new SP.RequestExecutor($sp.getSiteUrl()).executeAsync(query);
                });
            }).catch($spLog.error);
        };
        return (SPLoader);
    }]);

angular
    .module('ngSharepoint')
    .provider('$spLog', function() {
        var prefix = '[ngSharepoint] ';
        var enabled = true;
        return {
            setPrefix: function(prefix) {
                this.prefix = '[' + prefix + '] ';
            },
            setEnabled: function(enabled) {
                this.enabled = enabled;
            },
            $get: function() {
                return ({
                    error: function(msg) {
                        if (enabled) {
                            if (angular.isObject(msg)) {
                                console.error(prefix + 'Object: %O', msg);
                            }else {
                                console.error(prefix + msg);
                            }
                        }
                    },
                    warn: function(msg) {
                        if (enabled) {
                            if (angular.isObject(msg)) {
                                console.warn(prefix + 'Object: %O', msg);
                            }else {
                                console.warn(prefix + msg);
                            }
                        }
                    },
                    log: function(msg) {
                        if (enabled) {
                            if (angular.isObject(msg)) {
                                console.log(prefix + 'Object: %O', msg);
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

angular
    .module('ngSharepoint.Users', ['ngSharepoint'])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                $spLoader.loadScript('SP.Userprofiles.js');
            }
        }
    }]);

angular
    .module('ngSharepoint.Users')
    .factory('JsomSPUser', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
        var JsomSPUser = function(accountName) {
            this.accountName = accountName;
        };
        JsomSPUser.prototype.load = function() {
            var user = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Userprofiles.js').then(function() {
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
            });
        };
        return (JsomSPUser);
    }]);

angular
    .module('ngSharepoint.Users')
    .factory('RestSPUser', ['$q', '$spLoader', function($q, $spLoader) {
        var RestSPUser = function(accountName) {
            this.accountName = accountName;
        };
        RestSPUser.prototype.load = function() {
            var user = this;
            var endpoint = '_api/SP.UserProfiles.PeopleManager/getPropertiesFor(@account)' +
                '?@account=\'' + user.accountName + '\'';
            return $q(function(resolve, reject) {
                $spLoader({
                    method: 'GET',
                    url: endpoint
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
        return (RestSPUser);
    }]);

angular
    .module('ngSharepoint.Users')
    .factory('SPUser', ['$q', '$spLoader', '$sp', 'JsomSPUser', 'RestSPUser', function($q, $spLoader, $sp, JsomSPUser, RestSPUser) {
        var SPUser = function(accountName, load) {
            var user = this;
            if (angular.isUndefined(load)) {
                load = true;
            }
            user.accountName = accountName;
            if ($sp.getConnectionMode() === 'JSOM') {
                user.__user = new JsomSPUser(accountName);
            }else {
                user.__user = new RestSPUser(accountName);
            }
            if (load) {
                return user.load().then(function(data) {
                    user.from(data);
                });
            }else {
                return user;
            }
        };
        SPUser.prototype.from = function(data) {
            this.displayName = data.displayName;
            this.email = data.email;
            this.picture = data.picture;
            this.title = data.title;
            this.personalUrl = data.personalUrl;
            this.userUrl = data.userUrl;
            this.properties = data.properties;
        };
        SPUser.prototype.load = function() {
            return this.__user.load();
        };
        return (SPUser);
    }]);

angular
    .module('ngSharepoint.Users')
    .factory('$spUser', ['$q', '$sp', 'SPUser', function($q, $sp, SPUser) {
        return ({
            getCurrentUser: function() {
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
    }]);
