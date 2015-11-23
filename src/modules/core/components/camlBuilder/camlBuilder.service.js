angular
    .module('ngSharepoint')
    .factory('CamlBuilder', function(CamlTag) {
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
    });
