angular
    .module('ngSharepoint.Users')
    .factory('SPUser', function($q, $spLoader, $sp, JsomSPUser, RestSPUser) {
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
    });
