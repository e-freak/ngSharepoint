angular
    .module('ngSharepoint.Lists')
    .factory('$query', $query);

function $query($spList) {
    var Query = function() {
        this.columns = [];
        this.list = undefined;
        this.type = undefined;
        this.query = undefined;
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
