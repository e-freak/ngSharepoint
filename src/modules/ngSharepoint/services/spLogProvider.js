angular
	.module('ngSharepoint')
	.provider('$spLog', function() {
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
							if (typeof msg === 'object') {
								console.error(prefix + 'Object: %O', msg);
							}else {
								console.error(prefix + msg);
							}
						}
					},
					warn: function(msg) {
						if (enabled) {
							if (typeof msg === 'object') {
								console.warn(prefix + 'Object: %O', msg);
							}else {
								console.warn(prefix + msg);
							}
						}
					},
					log: function(msg) {
						if (enabled) {
							if (typeof msg === 'object') {
								console.log(prefix + 'Object: %O', msg);
							}else {
								console.log(prefix + msg);
							}
						}
					}
				});
			}
		};
	});