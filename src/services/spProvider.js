angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl;
		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
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