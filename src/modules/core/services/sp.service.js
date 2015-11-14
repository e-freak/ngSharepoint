angular
	.module('ngSharepoint')
	.provider('$sp', $spProvider);

function $spProvider() {
	var siteUrl = '';
	var connMode = 'JSOM';
	var token = false;
	var autoload = true;

	var provider = {
		setSiteUrl: setSiteUrl,
		setConnectionMode: setConnectionMode,
		setAccessToken: setAccessToken,
		setAutoload: setAutoload,
		$get: $sp
	};
	return provider;

	function setSiteUrl(newUrl) {
		siteUrl = newUrl;
	}
	function setConnectionMode(newConnMode) { //Only JSOM Supported for now
		if (newConnMode === 'JSOM' || newConnMode === 'REST') {
			connMode = newConnMode;
		}
	}
	function setAccessToken(newToken) {
		token = newToken;
	}
	function setAutoload(newAutoload) {
		autoload = newAutoload;
	}

	function $sp() {
		var service = {
			getSiteUrl: getSiteUrl,
			getConnectionMode: getConnectionMode,
			getAccessToken: getAccessToken,
			getContext: getContext,
			getAutoload: getAutoload
		};
		return service;

		function getContext() {
			return new SP.ClientContext();
		}
		function getSiteUrl() {
			return siteUrl;
		}
		function getConnectionMode() {
			return connMode;
		}
		function getAccessToken() {
			return token;
		}
		function getAutoload() {
			return autoload;
		}
	}
}