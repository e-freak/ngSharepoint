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
			parser.doc = new DOMParser().parseFromString(query);
			var viewFieldsTags = doc.getElementsByTagName('ViewFields');
			if (viewFieldsTags.length === 1) {
				var fieldTags = viewFieldsTags[0].getElementsByTagName('FieldRef');
				fieldTags.forEach(function(field) {
					parser.viewFields.push(field.attributes.Name.value);
				});
			}
			var queryTag = parser.doc.getElementsByTagName('Query');
			queryTag.childNodes.forEach(function(queryNode) {
				if (queryNode.nodeName == 'Where' || queryNode.nodeName == 'And' || queryNode.nodeName == 'Or') {
					parser.__parseWhere(queryNode, parser.where);
				}
			});
			return parser;
		};
		CamlParser.prototype.__parseWhere = function(tag, parentObject) {
			var parser = this;
			var obj = {};
			if (tag.nodeName == 'Where') {
				tag.childNodes.forEach(function(node) {
					obj.operator = node.nodeName;
					obj.column = node.getElementsByTagName('FieldRef')[0].attributes.Name.value;
					obj.value = node.getElementsByTagName('Value')[0].childNodes[0];
				});
			}else if (tag.nodeName == 'And' || tag.nodeName == 'Or') {
				obj.concat = tag.nodeName;
				obj.queries = [];
				tag.childNodes.forEach(function(childNode) {
					parser.__parseWhere(tag.childNode, obj.queries);
				});
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
		CamlParser.prototype.getWhere = function() {
			return this.where;
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