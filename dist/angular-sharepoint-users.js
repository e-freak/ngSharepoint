angular
    .module('ngSharepoint.Users', ['ngSharepoint'])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                $spLoader.loadScript('SP.Userprofiles.js');
            }
        }
    }]);
angular
    .module('ngSharepoint.Users')
    .factory('$spUser', ['$q', '$sp', 'SPUser', function($q, $sp, SPUser) {
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
    }]);
angular
    .module('ngSharepoint.Users')
    .factory('JsomSPUser', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
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
    }]);
angular
    .module('ngSharepoint.Users')
    .factory('RestSPUser', ['$q', '$spLoader', function($q, $spLoader) {
        var RestSPUser = function(accountName) {
            this.accountName = accountName;
        };
        RestSPUser.prototype.load = function() {
            var user = this;
            var endpoint = '_api/SP.UserProfiles.PeopleManager/getPropertiesFor(@account)?@account=\'' + user.accountName + '\'';
            return $q(function(resolve, reject) {
                $spLoader({
                    method: 'GET',
                    url: endpoint
                }).then(function(response) {
                    var data = {};
                    data.displayName = response.d.DisplayName;
                    data.email = response.d.Email;
                    data.picture = response.d.PictureUrl;
                    data.title = response.d.Title;
                    data.personalUrl = response.d.PersonalUrl;
                    data.userUrl = response.d.UserUrl;
                    resolve(data);
                }, reject);
            });
        };
        return (RestSPUser);
    }]);
angular
	.module('ngSharepoint.Users')
    .factory('SPUser', ['$q', '$spLoader', '$sp', 'JsomSPUser', 'RestSPUser', function($q, $spLoader, $sp, JsomSPUser, RestSPUser) {
        var SPUser = function(accountName, load) {
            var user = this;
            if (angular.isUndefined(load)) {
                load = true;
            }
            user.accountName = accountName;
            if ($sp.getConnectionMode() === 'JSOM') {
                user.__user = new JsomSPUser(accountName);
            }else {
                user.__user = new RestSPUser(accountName);
            }
            if (load) {
                return user.load().then(function(data) {
                    user.from(data);
                });
            }else {
                return user;
            }
        };
        SPUser.prototype.from = function(data) {
            this.displayName = data.displayName;
            this.email = data.email;
            this.picture = data.picture;
            this.title = data.title;
            this.personalUrl = data.personalUrl;
            this.userUrl = data.userUrl;
            this.properties = data.properties;
        };
        SPUser.prototype.load = function() {
            return this.__user.load();
        };
        return (SPUser);
    }]);