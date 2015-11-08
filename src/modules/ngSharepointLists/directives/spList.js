angular
	.module('ngSharepoint.Lists')
	.directive('spList', ['$spList', function($spList) {
		return {
			restrict: 'A',
			scope: {
				'spList': '@',
				'select': '=spSelect',
				'where': '=spWhere',
				'limit': '=spLimit',
				'order': '=spOrder',
				'asc': '=spAsc'
			},
			transclude: true,
			template: '<div ng-repeat="item in items" ng-transclude></div>',
			controller: function() {
				if (angular.isUndefined($scope.select)) $scope.select = '*';
				if (angular.isUndefined($scope.asc)) $scope.asc = true;
				var query = $spList.select($scope.select);
				if (angular.isDefined($scope.where)) {
					query.where($scope.where);
				}
				if (angular.isDefined($scope.limit)) {
					query.limit($scope.limit);
				}
				if (angular.isDefined($scope.order)) {
					query.orderBy($scope.order, $scope.asc);
				}
				query.then(function(data) {
					$scope.items = data;
				}, function(error) {
					console.error(error);
				});
			}
		};
	}]);