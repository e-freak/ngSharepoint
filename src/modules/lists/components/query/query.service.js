angular
    .module('ngSharepoint.Lists')
    .factory('$query', $query);

function $query($spList) {
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
            var Where = function(col, instance) {
                this.equals = function(value) {
                    instance.__query = {
                        comparator: 'equals',
                        column: col,
                        value: value
                    };
                    return instance;
                };
                this.greater = function(value) {
                    instance.__query = {
                        comparator: 'greater',
                        column: col,
                        value: value
                    };
                    return instance;
                };
                this.smaller = function(value) {
                    instance.__query = {
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
            this.__data[column] = value;
            return this;
        };
        this.value = function(column, value) {
            this.__data[column] = value;
            return this;
        };
        this.class = function(serializer) {
            this.__serializer = serializer;
            return this;
        };
        this.orderBy = function(field, asc) {
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
            return $spList.getList(this.list).query({
                type: this.__type,
                query: this.__query,
                limit: this.__limit,
                serializer: this.__serializer,
                order: this.__order,
                data: this.__data
            });
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
