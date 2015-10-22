angular
    .module('ngSharepoint')
    .provider('$spList', ['$sp', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', function ($sp, SelectQuery, UpdateQuery, InsertIntoQuery) {
        return {
            $get: function() {
                return ({
                    getLists: function() {
                        return $sp.getContext().get_web().get_lists();
                    },
                    getListById: function(id) {
                        return getLists().getById(id);
                    },
                    getListByName: function(name) {
                        return getLists().getByTitle(name);
                    },
                    select: function(fields) {
                        return new SelectQuery(fields);
                    },
                    update: function(list) {
                        return new UpdateQuery(list);
                    },
                    insertInto: function(list) {
                        return new InsertIntoQuery(list);
                    }
                });
            }
        };
    }]);