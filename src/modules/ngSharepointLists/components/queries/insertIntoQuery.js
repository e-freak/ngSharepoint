angular
    .module('ngSharepoint.Lists')
    .factory('InsertIntoQuery', function(SPList, Query) {
        var InsertIntoQuery = function(list) {
            this.__list = list;
            this.__values = {};
            return this;
        };
        InsertIntoQuery.prototype = new Query();
        InsertIntoQuery.prototype.value = function(key, value) {
            this.__values[key] = value;
            return this;
        };
        InsertIntoQuery.prototype.__execute = function() {
            return new SPList(this.__list).insert(this.__values);
        };
        return (InsertIntoQuery);
    });
