angular
    .module('ngSharepoint.Users')
    .factory('RestSPUser', ['$q', '$sp', '$spLoader', function($q, $sp, $spLoader) {
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