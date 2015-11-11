angular
	.module('ngSharepoint', []);
angular
	.module('ngSharepoint')
	.factory('$spCamlParser', function() {
		var CamlParser = function(query) {
			var parser = this;
			parser.viewFields = []; //['', '',...]
			parser.query = query; //[]
			parser.where = {}; //{concat: 'and', queries: [{comparator: '', column: '', value: ''}, {concat: 'or', queries: []}]}
			parser.orderBy = []; //[{col: '', asc: true}]
			parser.limit = -1;
			parser.doc = new DOMParser().parseFromString(query, 'text/xml');
			var viewFieldsTags = parser.doc.getElementsByTagName('ViewFields');
			if (viewFieldsTags.length === 1) {
				var fieldTags = viewFieldsTags[0].getElementsByTagName('FieldRef');
				for (var i = 0; i < fieldTags.length; i++) {
					var field = fieldTags[i];
					parser.viewFields.push(field.attributes.Name.value);
				}
			}
			var queryTags = parser.doc.getElementsByTagName('Query');
			if (queryTags.length === 1) {
				var queryTag = queryTags[0];
				for (var j = 0; j < queryTag.childNodes.length; j++) {
					var queryNode = queryTag.childNodes[j];
					if (queryNode.nodeName === 'Where' || queryNode.nodeName === 'And' || queryNode.nodeName === 'Or') {
						parser.__parseWhere(queryNode, parser.where);
					}
				}
			}
			var rowLimitTags = parser.doc.getElementsByTagName('RowLimit');
			if (rowLimitTags.length === 1) {
				parser.limit = parseInt(rowLimitTags[0].childNodes[0].nodeValue);
			}
			return parser;
		};
		CamlParser.prototype.__parseWhere = function(tag, parentObject) {
			var parser = this;
			var obj = {};
			if (tag.nodeName === 'Where') {
				var node = tag.childNodes[0];
				obj.operator = node.nodeName;
				obj.column = node.getElementsByTagName('FieldRef')[0].attributes.Name.value;
				obj.value = node.getElementsByTagName('Value')[0].childNodes[0].nodeValue;
			}else if (tag.nodeName === 'And' || tag.nodeName === 'Or') {
				obj.concat = tag.nodeName;
				obj.queries = [];
				for (var i = 0; i < tag.childNodes.length; i++) {
					parser.__parseWhere(tag.childNodes[i], obj.queries);					
				}
			}
			if (Array.isArray(parentObject)) {
				parentObject.push(obj);
			}else {
				Object.getOwnPropertyNames(obj).forEach(function(param) {
					parentObject[param] = obj[param];
				});
			}
		};
		CamlParser.prototype.getViewFields = function() {
			return this.viewFields;
		};
		CamlParser.prototype.hasViewFields = function() {
			return this.viewFields.length > 0;
		};
		CamlParser.prototype.getWhere = function() {
			return this.where;
		};
		CamlParser.prototype.hasWhere = function() {
			return (this.where !== null && this.where !== undefined && Object.getOwnPropertyNames(this.where) > 0);
		};
		CamlParser.prototype.getLimit = function() {
			return this.limit;
		};
		CamlParser.prototype.hasLimit = function() {
			return (this.limit !== null && this.limit !== undefined && !isNaN(this.limit) && this.limit >= 0);
		};
		CamlParser.prototype.getQuery = function() {
			return this.query;
		};
		return ({
			parse: function(query) {
				return new CamlParser(query);
			}
		});
	});
angular
	.module('ngSharepoint')
	.factory('CamlBuilder', ['CamlTag', function(CamlTag) {
		var CamlBuilder = function() {
			this.caml = [];
		};
		CamlBuilder.prototype.push = function(tag, attr, value) {
			var camlTag;
			if (tag instanceof CamlTag) {
				camlTag = tag;
			}else {
				camlTag = new CamlTag(tag, attr, value);
			}
			this.caml.push(camlTag);
			return camlTag;
		};
		CamlBuilder.prototype.findByName = function(name) {
			var result = [];
			this.caml.forEach(function(caml) {
				if (caml.name === name) {
					result.push(caml);
				}
			});
			return result;
		};
		CamlBuilder.prototype.build = function() {
			for (var i = 0; i < this.caml.length; i++) {
				this.caml[i] = this.caml[i].build();
			}
			return this.caml.join('');
		};
		return (CamlBuilder);
	}]);
angular
	.module('ngSharepoint')
	.factory('CamlTag', function() {
		var CamlTag = function(name, attr, value) {
			this.name = name;
			this.attr = attr || {};
			this.value = value;
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
		CamlTag.prototype.push = function(tag, attr, value) {
			var camlTag;
			if (tag instanceof CamlTag) {
				camlTag = tag;
			}else {
				camlTag = new CamlTag(tag, attr, value);
			}
			this.caml.push(camlTag);
			return camlTag;
		};
		CamlTag.prototype.setValue = function(value) {
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
  .factory('SPContext', ['$q', '$sp', function($q, $sp) {
    var SPContext = function() {
      this.context = $sp.getContext();
    };
    SPContext.prototype.getLists = function () {
      var sp = this;
      return $q(function(resolve, reject) {
        var lists = sp.context.get_web().get_lists();
        sp.context.load(lists);
        sp.context.executeQueryAsync(function(sender, args) {
          var result = [];
          var listEnumerator = lists.getEnumerator();
          while (listEnumerator.moveNext()) {
            var list = lists.get_current();
            
          }
        });
      });
    };
    return (SPContext);
  }]);

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
							if (typeof msg === "object") {
								console.error(prefix + "Object: %O", msg);
							}else {
								console.error(prefix + msg);
							}
						}
					},
					warn: function(msg) {
						if (enabled) {
							if (typeof msg === "object") {
								console.warn(prefix + "Object: %O", msg);
							}else {
								console.warn(prefix + msg);
							}
						}
					},
					log: function(msg) {
						if (enabled) {
							if (typeof msg === "object") {
								console.log(prefix + "Object: %O", msg);
							}else {
								console.log(prefix + msg);
							}
						}
					}
				});
			}
		};
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
			setConnectionMode: function(connMode) { //Only JSOM Supported for now
				if (connMode === "JSOM" || connMode === "REST") {
					this.connMode = connMode;
				}
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getConnectionMode: function() {
						return connMode;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					}
				});
			}
		};
	});
