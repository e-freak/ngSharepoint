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
			if (angular.isArray(parentObject)) {
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
			return (angular.isDefined(this.where) && this.where !== null && Object.getOwnPropertyNames(this.where) > 0);
		};
		CamlParser.prototype.getLimit = function() {
			return this.limit;
		};
		CamlParser.prototype.hasLimit = function() {
			return (angular.isDefined(this.where) && this.limit !== null && !isNaN(this.limit) && this.limit >= 0);
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