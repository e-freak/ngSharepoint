angular
    .module('ngSharepoint.Users')
    .factory('JsomSPUser', function($q, $sp, $spLoader) {
        var JsomSPUser = function(accountName) {
            this.accountName = accountName;
        };
        JsomSPUser.prototype.load = function() {
            var user = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Userprofiles.js').then(function() {
                    var context = $sp.getContext();
                    var peopleManager = new SP.UserProfiles.PeopleManager(context);
                    var properties = peopleManager.getPropertiesFor(user.accountName);
                    context.load(properties);
                    context.executeQueryAsync(function() {
                        var data = {};
                        data.displayName = properties.get_displayName();
                        data.email = properties.get_email();
                        data.picture = properties.get_pictureUrl();
                        data.title = properties.get_title();
                        data.personalUrl = properties.get_personalUrl();
                        data.userUrl = properties.get_userUrl();
                        resolve(data);
                    }, reject);
                });
            });
        };
        return (JsomSPUser);
    });
