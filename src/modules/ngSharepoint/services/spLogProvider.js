angular
	.module('ngSharepoint')
	.provider('$spLog', function() {
		var prefix = "[ngSharepoint] ";
		var enabled = true;
		return {
			setPrefix: function(prefix) {
				this.prefix = "[" + prefix + "] ";
			},
			setEnabled: function(enabled) {
				this.enabled = enabled;
			},
			$get: function() {
				return ({
					error: function(msg) {
						if (enabled) {
							console.error(prefix + msg);
						}
					},
					warn: function(msg) {
						if (enabled) {
							console.warn(prefix + msg);
						}
					},
					log: function(msg) {
						if (enabled) {
							console.log(prefix + msg);
						}
					}
				});
			}
		};
	});