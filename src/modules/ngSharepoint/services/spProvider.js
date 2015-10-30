angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl = "";
		var connMode = "JSOM"; //possible values: JSOM, REST
		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
			},
			setConnectionMode: function(connMode) {
				if (connMode == "JSOM" || connMode == "REST") {
					this.connMode = connMode;
				}
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					}
				});
			}
		};
	});