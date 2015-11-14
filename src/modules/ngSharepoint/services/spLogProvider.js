angular
	.module('ngSharepoint')
	.provider('$spLog', function($log) {
		var prefix = '[ngSharepoint] ';
		var enabled = true;
		return {
			setPrefix: function(prefix) {
				this.prefix = '[' + prefix + '] ';
			},
			setEnabled: function(enabled) {
				this.enabled = enabled;
			},
			$get: function() {
				return ({
					error: function(msg) {
						if (enabled) {
							if (angular.isObject(msg)) {
								$log.error(prefix + 'Object: %O', msg);
							}else {
								$log.error(prefix + msg);
							}
						}
					},
					warn: function(msg) {
						if (enabled) {
							if (angular.isObject(msg)) {
								$log.warn(prefix + 'Object: %O', msg);
							}else {
								$log.warn(prefix + msg);
							}
						}
					},
					log: function(msg) {
						if (enabled) {
							if (angular.isObject(msg)) {
								$log.log(prefix + 'Object: %O', msg);
							}else {
								$log.log(prefix + msg);
							}
						}
					}
				});
			}
		};
	});