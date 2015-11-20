angular
    .module('ngSharepoint.Lists')
    .factory('$query', $query);

function $query($spList) {
    var Query = function() {
        this.columns = [];
        this.list = undefined;
        this.type = undefined;
        this.query = undefined;
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
        this.from = function(list) {
            this.list = list;
            return this;
        };
        this.create = function(data) {
            if (angular.isUndefined(this.type)) {
                if (angular.isUndefined(data)) {
                    this.data = data;
                    this.type = 'create';
                }else {
                    throw 'No Data';
                }
            }else {
                throw 'Cannot use create after another query type was selected';
            }
            return this;
        };
        this.into = function(list) {
            this.list = list;
            return this;
        };
        this.update = function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'update';
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
            return this;
        };
        this.equals = function() {
            return this;
        };
        this.exec = function() {
            return $spList.getList(this.list).query(this);
        };
        this.then = function(resolve, reject) {
            return this.exec().then(resolve, reject);
        };
    };
    return new Query();
}
