angular
    .module('ngSharepoint.Lists')
    .factory('JSOMConnector', function($q, $sp) {
        return ({
            getLists: function() {
                return $q(function(resolve, reject) {
                    var context = $sp.getContext();
                    var lists = context.get_web().get_lists();
                    context.load(lists);
                    context.executeQueryAsync(function(sender, args) {
                        var result = [];
                        var listEnumerator = lists.getEnumerator();
                        while (listEnumerator.moveNext()) {
                            var list = lists.get_current();
                            result.push(list);
                        }
                        resolve(result);
                    }, reject);
                });
            }
        });
    });
