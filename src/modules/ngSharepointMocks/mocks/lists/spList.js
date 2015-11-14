angular
	.module('ngSharepoint.Mocks')
	.factory('SPList', function($q, $spCamlParser, lists) {
		var SPList = function(title) {
			this.title = title;
			this.list = lists[title]; //{cols: [], data:[[]]}
		};
		SPList.prototype.insert = function(data) {
			var list = this;
			return $q(function(resolve, reject) {
				var alignedData = [];
				for (var i = 0; i < list.list.cols.length; i++) {
					alignedData[i] = data[list.list.cols[i]];
				}
				this.list.data.push(alignedData);
				resolve(data);
			});
		};
		SPList.prototype.select = function(query) {
			var list = this;
			return $q(function(resolve, reject) {
				var data = [];
				var result = [];
				var parser = $spCamlParser.parse(query);
				if (parser.hasWhere()) {
					var where = parser.getWhere();
					for (var i = 0; i < list.list.data.length; i++) {
						var row = list.list.data[i];
						if (list.__filter(where, row)) {
							data.push(row);
						}
					}
				}else {
					data = list.list.data;
				}
				if (parser.hasViewFields()) {
					var cols = [];
					parser.getViewFields().forEach(function(field) {
						var colId = list.list.cols.indexOf(field);
						if (colId === -1) {
							reject('Invalid column name');
						}else {
							cols.push(colId);
						}
					});
					result = [];
					data.forEach(function(row) {
						var entry = {};
						for (var i = 0; i < row.length; i++) {
							if (cols.indexOf(i) !== -1) {
								entry[list.list.cols[i]] = row[i];
							}
						}
						result.push(entry);
					});
					data = result;
				}else {
					result = [];
					data.forEach(function(row) {
						var entry = {};
						for (var i = 0; i < row.length; i++) {
							if (list.list.cols.indexOf(i) !== -1) {
								entry[list.list.cols[i]] = row[i];
							}
						}
						result.push(entry);
					});
					data = result;
				}
				if (parser.hasLimit()) {
					result = [];
					for (var k = 0; k < parser.geLimit(); k++) {
						result.push(data[k]);
					}
					data = result;
				}
			});
		};
		SPList.prototype.delete = function(query) {
			return $q(function(resolve, reject) {

			});
		};
		SPList.prototype.update = function(query, data) {
			return $q(function(resolve, reject) {

			});
		};
		SPList.prototype.__filter = function(row, query) {
			//TODO: Implement
			return true;
							/*camlQuery = parser.parseFromString(query, 'text/xml');
				var queryTag = camlQuery.getElementsByTagName('Query')[0];
				if (queryTag !== null) {
					var equalTags = queryTag.getElementsByTagName('Eq');
					if (equalTags !== null) {
						var eqs = [];
						equalTags.forEach(function(tag) {
							var field = tag.getElementsByTagName('FieldRef')[0].attributes.Name.value;
							var fieldId = list.list.cols.indexOf(field);
							var value = tag.getElementsByTagName('Value')[0].childNodes[0];
							eqs.push({id: fieldId, value: value});
						});
						for (var i = 0; i < list.list.data.length; i++) {
							var row = list.list.data[i];
							var valid = true;
							for (var j = 0; j < eqs.length; j++) {
								var eq = eqs[j];
								if (row[eq.id] != eq.value) {
									valid = false;
									break;
								}
							}
							if (valid) {
								data.push(row);
							}
						}
					}
				}else {
					data = list.list.data;
				}*/
		};
	});