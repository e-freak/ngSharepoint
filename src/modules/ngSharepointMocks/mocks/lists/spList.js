angular
	.module('ngSharepoint.Mocks')
	.factory('SPList', ['lists', function(lists) {
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
				resolve();
			});
		};
		SPList.prototype.select = function(query) {
			var list = this;
			return $q(function(resolve, reject) {
				var data = [];
				var parser = new DOMParser();
				camlQuery = parser.parseFromString(query, 'text/xml');
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
				}
				var viewFieldsTag = camlQuery.getElementsByTagName('ViewFields')[0];
				if (viewFieldsTag !== null) {
					var cols = [];
					viewFieldsTag.getElementsByTagName('FieldRef').forEach(function(field) {
						var colId = list.list.cols.indexOf(field.attributes.Name.value);
						if (colId === -1) {
							reject('Invalid column name');
						}else {
							cols.push(colId);
						}
					});
					data.forEach(function(row) {
						var entry = [];
						for (var i = 0; i < row.length; i++) {
							if (cols.indexOf(i) !== -1) {

							}
						}
					});
				}
				var rowLimitTag = camlQuery.getElementsByTagName('RowLimit')[0];
				if (rowLimitTag !== null) {
					var limit = rowLimitTag.nodeValue;
					var result = [];
					for (var k = 0; k < limit; k++) {
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
	}]);