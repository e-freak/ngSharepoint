angular
    .module('ngSharepointUsers')
    .factory('$spUser', ['$q', '$sp', 'SPUser', function ($q, $sp, SPUser) {
        return {
            $get: ['$q', '$sp', function($q, $sp) {
                return({
                    getCurrentUser: function() {
                        //TODO: Abstract with SPUser
                        return $q(function(resolve, reject) {
                            var context = $sp.getContext();
                            var peopleManager = new SP.UserProfiles.PeopleManager(context);
                            var properties = peopleManager.getMyProperties();
                            context.load(properties);
                            context.executeQueryAsync(function() {
                                resolve(properties);
                            }, reject);
                        });
                    },
                    getUser: function(accountName) {
                        return new SPUser(accountName);
                    }
                });
            }]
        };
    }]);