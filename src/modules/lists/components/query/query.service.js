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
                    'daterangesOverlap',
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
                            comparator: comparator,
                            column: col,
                            value: value
                        };
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
