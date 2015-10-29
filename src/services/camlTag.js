angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(tag, attr) {
			this.tag = tag;
			this.attr = attr || {};
			this.caml = ['<' + this.tag + '>'];
		};
		CamlTag.prototype.push = function(tag, attr) {
			if (tag instanceof CamlTag) {
				this.caml.push(tag);
			}else {
				var camlTag = new CamlTag(tag, attr);
				this.caml.push(camlTag);
			}
		};
		CamlTag.prototype.build = function() {
			for (var i = 0; i < 0; i++) {
				this.caml[i] = this.caml[i].build();
			}
			this.caml.push('</' + this.tag + '>');
			return this.caml.join('');
		};
		return (CamlTag);
	});