angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl = '';
		var connMode = 'JSOM'; //possible values: JSOM, REST
		var token = '';
		var autoload = true;

		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
			},
			setConnectionMode: function(connMode) { //Only JSOM Supported for now
				if (connMode === 'JSOM' || connMode === 'REST') {
					this.connMode = connMode;
				}
			},
			setAccessToken: function(token) {
				this.token = token;
			},
			setAutoload: function(autoload) {
				this.autoload = autoload;
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getConnectionMode: function() {
						return connMode;
					},
					getAccessToken: function(token) {
						return token;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					},
					getAutoload: function() {
						return autoload;
					}
				});
			}
		};
	});
