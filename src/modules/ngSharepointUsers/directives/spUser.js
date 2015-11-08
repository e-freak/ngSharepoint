angular
	.module('ngSharepoint.Users')
	.directive('spUser', ['$spUser', function($spUser) {
		return {
			restrict: 'E',
			scope: {
				'name': '@'
			},
			transclude: true,
			template: '<div ng-transclude></div>',
			link: function(scope, element, attrs) {
				scope.$watch(attrs.name, function(value) {
					$spUser.getUser(value).then(function(user) {
						scope.user = user;
					});
				});
			}
		};
	}]);