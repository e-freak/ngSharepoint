angular
	.module('ngSharepoint')
	.factory('Query', function() {
		var Query = function() {
			this.__queries = {};
		};
        Query.prototype.unpackItem = function(item) {
            var query = this;
            var obj = {};
            if (Array.isArray(query.__values)) {
                query.__values.forEach(function(key) {
                    var value = item.get_item(key);
                    obj[key] = value;
                });                
            }else {
                Object.getOwnPropertyNames(query.__values).forEach(function(key) {
                    var value = item.get_item(key);
                    obj[key] = value;
                });
            }
            return obj;
        };
        Query.prototype.packItem = function(item) {
            var query = this;
            Object.getOwnPropertyNames(query.__values).forEach(function(key) {
                item.set_item(key, query.__values[key]);
            });
        };
        Query.prototype.then = function(success, reject) {
        	return this.__execute().then(success, reject);
        };
		return (Query);
	});