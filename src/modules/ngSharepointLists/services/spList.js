angular
    .module('ngSharepoint.Lists')
    .factory('$spList', ['$sp', 'SPList', 'JSOMConnector', 'RESTConnector', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function ($sp, SPList, JSOMConnector, RESTConnector, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
                return new SPList(title);
            },
            getLists: function() {
                var promise;
                if ($sp.getConnectionMode() === 'JSOM') {
                    promise = JSOMConnector.getLists();
                }else {
                    promise = RESTConnector.getLists();
                }
                return promise.then(function(listNames) {
                    var lists = [];
                    listNames.forEach(function(name) {
                        lists.push(new SPList(name));
                    });
                    return lists;
                });
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