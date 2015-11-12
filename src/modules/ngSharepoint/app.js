angular
    .module('ngSharepoint', [])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                $spLoader.load($sp.getSiteUrl() + '/_layouts/15/SP.Runtime.js');
                $spLoader.load($sp.getSiteUrl() + '/_layouts/15/SP.js');
            }
        }
    }]);