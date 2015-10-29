angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(name, attr) {
			this.name = name;
			this.attr = attr || {};
			this.caml = [];
		};
		CamlTag.prototype.__buildTag = function() {
			var tag = this;
			var xml = '<';
			xml += tag.name;
			if (Object.getOwnPropertyNames(tag.attr).length > 0) {
				Object.getOwnPropertyNames(tag.attr).forEach(function(key) {
					xml += ' ';
					xml += key;
					xml += '=';
					xml += '"' + tag.attr[key] + '"';
				});
			}
			if (this.caml.length === 0) {
				xml += '/>';
			}else {
				xml += '>';
			}
			return xml;
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
			this.caml.push(this.__buildTag());
			for (var i = 0; i < 0; i++) {
				this.caml[i] = this.caml[i].build();
			}
			if (this.caml.length > 1) {
				this.caml.push('</' + this.name + '>');
			}
			return this.caml.join('');
		};
		return (CamlTag);
	});