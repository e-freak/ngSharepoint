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
            return (angular.isDefined(this.where) && this.where !== null && Object.getOwnPropertyNames(this.where) > 0);
        };
        CamlParser.prototype.getLimit = function() {
            return this.limit;
        };
        CamlParser.prototype.hasLimit = function() {
            return (angular.isDefined(this.where) && this.limit !== null && !isNaN(this.limit) && this.limit >= 0);
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
    var siteUrl = '';
    var connMode = 'JSOM';
    var token = false;
    var autoload = true;

    var provider = {
        setSiteUrl: setSiteUrl,
        setConnectionMode: setConnectionMode,
        setAccessToken: setAccessToken,
        setAutoload: setAutoload,
        $get: $sp
    };
    return provider;

    function setSiteUrl(newUrl) {
        siteUrl = newUrl;
    }
    function setConnectionMode(newConnMode) { //Only JSOM Supported for now
        if (newConnMode === 'JSOM' || newConnMode === 'REST') {
            connMode = newConnMode;
        }
    }
    function setAccessToken(newToken) {
        token = newToken;
    }
    function setAutoload(newAutoload) {
        autoload = newAutoload;
    }

    function $sp() {
        var service = {
            getSiteUrl: getSiteUrl,
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
            //TODO: Request the Request Digest in SPContext
            return $q(function(resolve, reject) {
                $http({
                    method: 'POST',
                    url: $sp.getSiteUrl() + '_api/contextInfo',
                    headers: {
                        'X-FORMS_BASED_AUTH_ACCEPTED': 'f',
                        'Accept': 'application/json; odata=verbose',
                        'Content-Type': 'application/json; odata=verbose'
                    }
                }).then(function(data) {
                    var query = {
                        url: $sp.getSiteUrl() + queryObject.url,
                        method: queryObject.method,
                        headers: {
                            //'X-FORMS_BASED_AUTH_ACCEPTED': 'f',
                            'X-RequestDigest': data.d.GetContextWebInformation.FormDigestValue,
                            'Accept': 'application/json; odata=verbose',
                            'Content-Type': 'application/json; odata=verbose'
                        }
                    };
                    if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken()) {
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
                    }else {
                        if (queryObject.hasOwnProperty('data') &&
                            angular.isDefined(queryObject.data) &&
                            queryObject !== null) {
                            query.data = queryObject.data;
                        }
                        query.headers.Authorization = 'Bearer ' + $sp.getAccessToken();
                        $http(query).then(resolve, reject);
                    }
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
