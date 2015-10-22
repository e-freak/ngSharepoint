angular
	.module('ngSharepoint')
	.factory('CamlBuilder', function() {
		var CamlBuilder = function() {
			this.camlQuery = new SP.CamlQuery();
			this.caml = [];
		};
		CamlBuilder.prototype.add = function(text) {
			this.caml.push(caml);
		};
		CamlBuilder.prototype.build = function() {
			this.camlQuery.set_viewXml(this.caml.join['']);
			return this.camlQuery;
		};
		return (CamlBuilder);
	});