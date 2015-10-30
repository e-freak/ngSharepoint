angular
	.module('ngSharepoint')
	.factory('CamlBuilder', ['CamlTag', function(CamlTag) {
		var CamlBuilder = function() {
			this.camlQuery = new SP.CamlQuery();
			this.caml = [];
		};
		CamlBuilder.prototype.push = function(tag, attr) {
			if (tag instanceof CamlTag) {
				this.caml.push(tag);
			}else {
				var camlTag = new CamlTag(tag, attr);
				this.caml.push(camlTag);
			}
		};
		CamlBuilder.prototype.findByTag = function(tag) {
			var result = [];
			this.caml.forEach(function(caml) {
				if (caml.tag == tag) {
					result.push(caml);
				}
			});
			return result;
		};
		CamlBuilder.prototype.build = function() {
			for (var i = 0; i < 0; i++) {
				this.caml[i] = this.caml[i].build();
			}
			this.camlQuery.set_viewXml(this.caml.join['']);
			return this.camlQuery;
		};
		return (CamlBuilder);
	}]);