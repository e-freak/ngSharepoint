angular
	.module('ngSharepoint.Lists')
	.factory('RestSPList', ['$q', '$sp', '$http', function($q, $sp, $http) {
		var RestSPList = function(title) {
			this.title = title;
		};
		RestSPList.prototype.select = function(query) {
		var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/GetItems";
		var body = {
			query: {
				__metadata: {
					type: "SP.CamlQuery"
				},
				ViewXml: query
			}
		};
		var headers = {
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"Accept": "application/json; odata=verbose",
			"Content-Type": "application/json; odata=verbose"
		};
		return $q(function(resolve, reject) {
			$http({
				method: 'POST',
				url: $sp.getSiteUrl() + endpoint,
				data: body,
				headers: headers
			}).then(function(data) {
				//TODO: Parse Result
			}, reject);
		});
		};
		RestSPList.prototype.insert = function(data) {
		var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/items";
		var body = {
			__metadata: {
				type: 'SP.Data.TestListItem'
			}
		};
		var headers = {
			"X-RequestDigest": $("#__REQUESTDIGEST").val(),
			"Accept": "application/json; odata=verbose",
			"Content-Type": "application/json; odata=verbose"
		};
		Object.getOwnPropertyNames(data).forEach(function(key) {
			var value = data[key];
			if (value !== null && value !== undefined && typeof value === 'string') {
				value = value.trim();
			}
			body[key] = value;
		});
		return $q(function(resolve, reject) {
			$http({
				method: 'POST',
				url: $sp.getSiteUrl() + endpoint,
				data: body,
				headers: headers
			}).then(function(data) {
				//TODO: Parse Result
			}, reject);
		});
		};
		RestSPList.prototype.delete = function(query) {
			//TODO: Implement
		};
		RestSPList.prototype.update = function(query, data) {
			//TODO: Implement
		};
		return (RestSPList);
	}]);