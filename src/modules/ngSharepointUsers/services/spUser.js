angular
	.module('ngSharepoint.Users')
	.factory('SPUser', ['$q', '$http', '$sp', function($q, $http, $sp) {
		var SPUser = function(accountName, load) {
			var user = this;
			if (angular.isUndefined(load)) {
				load = true;
			}
			user.accountName = accountName;
			if ($sp.getConnectionMode() === "JSOM") {
				user.__list = new JsomSPUser(accountName);
			}else {
				user.__list = new RestSPUser(accountName);
			}
			if (load) {
				return $q(function(resolve, reject) {
					user.load().then(function(data) {
						user.displayName = data.displayName;
						user.email = data.email;
						user.picture = data.picture;
						user.title = data.title;
						user.personalUrl = data.personalUrl;
						user.userUrl = data.userUrl;
						user.properties = data.properties;
					}).then(resolve, reject);
				});
			}else {
				return user;
			}
		};
		SPUser.prototype.load = function() {
			return this.__list.load();
		};
		var JsomSPUser = function(accountName) {
			this.accountName = accountName;
		};
		JsomSPUser.prototype.load = function() {
			var user = this;
			return $q(function(resolve, reject) {
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
		};
		var RestSPUser = function(accountName) {
			this.accountName = accountName;
		};
		RestSPUser.prototype.load = function() {
			var user = this;
			var endpoint = "_api/SP.UserProfiles.PeopleManager/getPropertiesFor(@account)?@account='" + user.accountName + "'";
			var headers = {
				"X-RequestDigest": $("#__REQUESTDIGEST").val(),
          		"Accept": "application/json; odata=verbose",
          		"Content-Type": "application/json; odata=verbose"
			};
			return $q(function(resolve, reject) {
				$http({
					method: 'GET',
					url: $sp.getSiteUrl() + endpoint,
					headers: headers
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
	}]);