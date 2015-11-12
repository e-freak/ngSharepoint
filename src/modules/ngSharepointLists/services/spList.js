angular
    .module('ngSharepoint.Lists')
    .factory('$spList', ['SPList', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function (SPList, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
              return new SPList(title);
            },
            select: function(fields) {
                return new SelectQuery(fields);
            },
            update: function(list) {
                return new UpdateQuery(list);
            },
            insertInto: function(list) {
                return new InsertIntoQuery(list);
            },
            delete: function() {
                return new DeleteQuery();
            }
        });
    }]);