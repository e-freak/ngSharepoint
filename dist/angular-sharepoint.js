angular
	.module('ngSharepoint', []);
angular
	.module('ngSharepoint')
	.factory('CamlBuilder', ['CamlTag', function(CamlTag) {
		var CamlBuilder = function() {
			this.camlQuery = new SP.CamlQuery();
			this.caml = [];
		};
		CamlBuilder.prototype.push = function(tag, attr, value) {
			if (tag instanceof CamlTag) {
				this.caml.push(tag);
			}else {
				var camlTag = new CamlTag(tag, attr, value);
				this.caml.push(camlTag);
			}
		};
		CamlBuilder.prototype.findByName = function(name) {
			var result = [];
			this.caml.forEach(function(caml) {
				if (caml.name == name) {
					result.push(caml);
				}
			});
			return result;
		};
		CamlBuilder.prototype.build = function() {
			for (var i = 0; i < 0; i++) {
				this.caml[i] = this.caml[i].build();
			}
			this.camlQuery.set_viewXml(this.caml.join(''));
			return this.camlQuery;
		};
		return (CamlBuilder);
	}]);
angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(name, attr, value) {
			this.name = name;
			this.attr = attr || {};
			this.value = value || undefined;
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
			if (this.caml.length === 0 && angular.isUndefined(this.value)) {
				xml += '/>';
			}else {
				xml += '>';
				if (angular.isDefined(this.value)) {
					xml += this.value;
				}
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
		CamlTag.prototype.setVal = function(value) {
			this.value = value;
		};
		CamlTag.prototype.build = function() {
			var query = this.__buildTag();
			for (var i = 0; i < this.caml.length; i++) {
				query += this.caml[i].build();
			}
			if (this.caml.length > 0 || angular.isDefined(this.value)) {
				query += '</' + this.name + '>';
			}
			return query;
		};
		return (CamlTag);
	});
angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl = "";
		var connMode = "JSOM"; //possible values: JSOM, REST
		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
			},
			setConnectionMode: function(connMode) {
				if (connMode == "JSOM" || connMode == "REST") {
					this.connMode = connMode;
				}
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					}
				});
			}
		};
	});