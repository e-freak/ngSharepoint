angular
    .module('ngSharepoint', [])
    .run(['$sp', '$spLoader', function($sp, $spLoader) {
        if ($sp.getAutoload()) {
            if ($sp.getConnectionMode() === 'JSOM') {
                $spLoader.loadScript('//ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js');
                $spLoader.loadScript('SP.Runtime.js');
                $spLoader.loadScript('SP.js');                    
            }else if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken) {
            	$spLoader.loadScript('SP.RequestExecutor.js');
            }
        }
    }]);