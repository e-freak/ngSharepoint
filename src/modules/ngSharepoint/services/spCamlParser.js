angular
	.module('ngSharepoint')
	.factory('$spCamlParser', function() {
		var CamlParser = function(query) {
			this.parser = new DOMParser();
			this.doc = this.parser.parseFromString(query);
		};
		CamlParser.prototype.getViewFields = function() {
			return [];
		};
		return ({
			parse: function(query) {
				return new CamlParser(query);
			}
		});
	});