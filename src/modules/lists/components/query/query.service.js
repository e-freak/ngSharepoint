angular
    .module('ngSharepoint.Lists')
    .factory('$query', $query);

function $query($spList) {
    var Query = function() {
        this.columns = [];
        this.list = undefined;
        this.type = undefined;
        this.query = undefined;
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
            var Where = function(col, obj) {
                this.equals = function(value) {
                    obj.query = {
                        comparator: 'equals',
                        column: col,
                        value: value
                    };
                    return obj;
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
        'update': function() {
            return new Query().update();
        },
        'delete': function() {
            return new Query().delete();
        }
    });
}
