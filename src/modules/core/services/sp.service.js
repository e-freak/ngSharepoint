angular
    .module('ngSharepoint')
    .provider('$sp', $spProvider);

function $spProvider() {
    var siteUrl;
    var hostUrl;
    var connMode = 'JSOM';
    var token = false;
    var autoload = true;

    var provider = {
        setSiteUrl: setSiteUrl,
        setHostUrl: setHostUrl,
        setConnectionMode: setConnectionMode,
        setAccessToken: setAccessToken,
        setAutoload: setAutoload,
        $get: $sp
    };
    return provider;

    function setHostUrl(newUrl) {
        if (angular.isDefined(newUrl) && angular.isString(newUrl)) {
            hostUrl = newUrl;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setSiteUrl(newUrl) {
        if (angular.isDefined(newUrl) && angular.isString(newUrl)) {
            siteUrl = newUrl;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setConnectionMode(newConnMode) {
        if (angular.isDefined(newConnMode) && angular.isString(newConnMode)) {
            newConnMode = newConnMode.toUpperCase();
            if (newConnMode === 'JSOM' || newConnMode === 'REST') {
                connMode = newConnMode;
            }else {
                throw 'Invalid Argument Exception';
            }
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setAccessToken(newToken) {
        if (angular.isDefined(newToken) && angular.isString(newToken)) {
            token = newToken;
        }else {
            throw 'Invalid Argument Exception';
        }
    }
    function setAutoload(newAutoload) {
        if (angular.isDefined(newAutoload)) {
            if (newAutoload === true || newAutoload === false) {
                autoload = newAutoload;
            }else {
                throw 'Invalid Argument Exception';
            }
        }else {
            throw 'Invalid Argument Exception';
        }
    }

    function $sp() {
        var service = {
            getSiteUrl: getSiteUrl,
            getHostUrl: getHostUrl,
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
        function getHostUrl() {
            return hostUrl;
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
