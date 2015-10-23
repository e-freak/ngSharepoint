angular
    .module('ngSharepoint')
    .factory('$spList', ['$sp', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', function ($sp, SelectQuery, UpdateQuery, InsertIntoQuery) {
        return ({
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