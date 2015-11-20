angular
    .module('ngSharepoint.Lists')
    .factory('$query', $query);

function $query($spList) {
    var Query = {
        'columns': [],
        'list': undefined,
        'type': undefined,
        'query': undefined,
        'read': function(cols) {
            if (angular.isUndefined(this.type)) {
                if (angular.isUndefined(cols)) {
                    cols = '*';
                }
                this.columns = cols;
                this.type = 'read';
            }else {
                throw 'Cannot use select after another query type was selected';
            }
            return this;
        },
        'from': function(list) {
            this.list = list;
            return this;
        },
        'create': function(data) {
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
        },
        'into': function(list) {
            this.list = list;
            return this;
        },
        'update': function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'update';
            }else {
                throw 'Cannot use update after another query type was selected';
            }
            return this;
        },
        'delete': function() {
            if (angular.isUndefined(this.type)) {
                this.type = 'delete';
            }else {
                throw 'Cannot use delete after another query type was selected';
            }
            return this;
        },
        'where': function(col) {
            return this;
        },
        'equals': function() {
            return this;
        },
        'exec': function() {
            return $spList.getList(this.list).query(this);
        },
        'then': function(resolve, reject) {
            return this.exec().then(resolve, reject);
        }
    };
    return Query;
}
