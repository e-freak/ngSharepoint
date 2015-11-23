angular
    .module('ngSharepoint.Lists')
    .factory('JsomSPList', function($q, $sp, $spLoader, $spCamlParser) {
        var JsomSPList = function(title) {
            this.title = title; //TODO: Get by GUID
        };
        JsomSPList.prototype.getGUID = function() {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    context.load(list);
                    context.executeQueryAsync(function() {
                        resolve(list.get_id().toString());
                    }, reject);
                });
            });
        };
        JsomSPList.prototype.getTitle = function() {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.title);
                    context.load(list);
                    context.executeQueryAsync(function() {
                        resolve(list.get_title());
                    }, reject);
                }, reject);
            });
        };
        JsomSPList.prototype.setTitle = function(title) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var context = $sp.getContext();
                    var list = context.get_web().get_lists().getByTitle(that.list);
                    list.set_title(title);
                    list.update();
                    context.executeQueryAsync(function() {
                        that.title = title;
                        resolve();
                    }, reject);
                }, reject);
            })
        };
        JsomSPList.prototype.readColumns = function(query) {
            var that = this;
            return $q(function(resolve, reject) {
                var columns = $spCamlParser.parse(query).getViewFields();
                if (columns.length <= 0) {
                    $spLoader.waitUntil('SP.Core').then(function() {
                        var context = $sp.getContext();
                        var list = context.get_web().get_lists().getByTitle(that.title);
                        var fields = list.get_fields();
                        context.load(fields, 'Include(Title)');
                        context.executeQueryAsync(function() {
                            var itemIterator = fields.getEnumerator();
                            while (itemIterator.moveNext()) {
                                var field = itemIterator.get_current();
                                if (field.get_title() !== 'BDC Identity') { //TODO: Make configurable
                                    columns.push(field.get_title());
                                }
                            }
                            resolve(columns);
                        }, reject);
                    }, reject);
                }else {
                    resolve(columns);
                }
            });
        };
        JsomSPList.prototype.read = function(query, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                that.readColumns(query).then(function(columns) {
                    $spLoader.waitUntil('SP.Core').then(function() {
                        var context = $sp.getContext();
                        var list = context.get_web().get_lists().getByTitle(that.title);
                        var camlQuery = new SP.CamlQuery();
                        camlQuery.set_viewXml(query);
                        var items = list.getItems(camlQuery);
                        context.load(items);
                        context.executeQueryAsync(function() {
                            var result = [];
                            var itemIterator = items.getEnumerator();
                            while (itemIterator.moveNext()) {
                                var item = itemIterator.get_current();
                                result.push(that.__unpack(item, columns, serializer));
                            }
                            resolve(result);
                        }, function(sender, args) {
                            reject(args);
                        });
                    }, reject);
                });
            });
        };
        JsomSPList.prototype.create = function(data, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var itemInfo = new SP.ListItemCreationInformation();
                    var item = list.addItem(itemInfo);
                    that.__pack(item, data, serializer);
                    item.update();
                    clientContext.load(item);
                    clientContext.executeQueryAsync(function() {
                        resolve(data);
                    }, function(sender, args) {
                        reject(args);
                    });
                });
            });
        };
        JsomSPList.prototype.delete = function(query) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
                    var items = list.getItems(camlQuery);
                    clientContext.load(items);
                    clientContext.executeQueryAsync(function() {
                        var itemIterator = items.getEnumerator();
                        var a = [];
                        while (itemIterator.moveNext()) {
                            var item = itemIterator.get_current();
                            a.push(item);
                        }
                        a.forEach(function(item) {
                            item.deleteObject();
                        });
                        clientContext.executeQueryAsync(function(sender, args) {
                            resolve(args);
                        }, function(sender, args) {
                            reject(args);
                        });
                    },
                    function(sender, args) {
                        reject(args);
                    });
                });
            });
        };
        JsomSPList.prototype.update = function(query, data, serializer) {
            var that = this;
            return $q(function(resolve, reject) {
                $spLoader.waitUntil('SP.Core').then(function() {
                    var clientContext = $sp.getContext();
                    var list = clientContext.get_web().get_lists().getByTitle(that.title);
                    var camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml(query);
                    var items = list.getItems(camlQuery);
                    clientContext.load(items);
                    clientContext.executeQueryAsync(function() {
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                            var item = itemIterator.get_current();
                            that.__pack(item, data, serializer);
                            item.update();
                        }
                        clientContext.executeQueryAsync(function(sender, args) {
                            resolve(args);
                        }, function(sender, args) {
                            reject(args);
                        });
                    }, function(sender, args) {
                        reject(args);
                    });
                });
            });
        };
        JsomSPList.prototype.__pack = function(item, data, serializer) {
            if (angular.isDefined(serializer)) {
                data = serializer.__serialize();
            }
            Object.getOwnPropertyNames(data).forEach(function(key) {
                var value = data[key];
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
                    value = value.trim();
                }
                item.set_item(key, value);
            });
        };
        JsomSPList.prototype.__unpack = function(item, cols, serializer) {
            var obj = {};
            if (!angular.isArray(cols)) {
                cols = Object.getOwnPropertyNames(cols);
            }
            cols.forEach(function(key) {
                var value = item.get_item(key);
                if (angular.isDefined(value) && value !== null && angular.isString(value)) {
                    value = value.trim();
                }
                obj[key] = value;
            });
            if (angular.isDefined(serializer)) {
                return serializer.__deserialize(obj);
            }
            return obj;
        };
        return (JsomSPList);
    });
