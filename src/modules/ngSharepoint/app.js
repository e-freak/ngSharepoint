angular
    .module('ngSharepoint', [])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                $spLoader.loadScripts('SP.Core', ['//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js', 'SP.Runtime.js', 'SP.js']);                    
            }else if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken()) {
                $spLoader.loadScript('SP.RequestExecutor.js');
            }
        }
    }]);