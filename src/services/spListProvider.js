angular
    .module('ngSharepoint')
    .provider('$spList', function () {
        var siteUrl = "";
        var default_limit = 500;
        var Query = function() {};
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
        var Select_Query = function(list, fields) {
            this.__list = list;
            this.__values = fields;
            this.__where = null;
            this.__limit = null;
            return this;
        };
        Select_Query.prototype = new Query();
        Select_Query.prototype.where = function(field) {
            this.__where = new Where_Query(this, field);
            return this.__where;
        };
        Select_Query.prototype.limit = function(amount) {
            this.__limit = amount;
        };
        Select_Query.prototype.execute = function() {
            var query = this;
            return new Promise(function(resolve, reject) {
                var clientContext = new SP.ClientContext(siteUrl);
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where !== null) {
                    query.__where.push(caml);
                }
                caml.push('<ViewFields>');
                query.__values.forEach(function(field) {
                    caml.push('<FieldRef Name="' + field + '"/>');
                });
                caml.push('</ViewFields>');
                if (query.__limit !== null) {
                    caml.push('<RowLimit>' + query.__limit + '</RowLimit>');
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = list.getItems(camlQuery);
                clientContext.load(items);
                clientContext.executeQueryAsync(
                    function(sender, args) {
                        var result = [];
                        var itemIterator = items.getEnumerator();
                        while (itemIterator.moveNext()) {
                           var item = itemIterator.get_current();
                           result.push(query.unpackItem(item));
                        } 
                        resolve(result);
                    },
                    function(sender, args) {
                        reject(args);
                    }
                );
            });
        };
        var Update_Query = function(list) {
            this.__list = list;
            this.__values = {};
            this.__where = null;
        };
        Update_Query.prototype = new Query();
        Update_Query.prototype.where = function(field) {
            this.__where = new Where_Query(this, field);
            return this.__where;
        };
        Update_Query.prototype.execute = function() {
            var query = this;
            return new Promise(function(resolve, reject) {
                var clientContext = new SP.ClientContext(siteUrl);
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where !== null) {
                    query.__where.push(caml);
                }
                caml.push('</View>');
                camlQuery.set_viewXml(caml.join(''));
                var items = list.getItems(camlQuery);
                clientContext.load(items);
                clientContext.executeQueryAsync(function(sender, args) {
                    var itemIterator = items.getEnumerator();
                    while (itemIterator.moveNext()) {
                        var item = itemIterator.get_current();
                        query.packItem(item);
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
        };
        Update_Query.prototype.set = function(key, value) {
            this.__values[key] = value;
            return this;
        };
        var Insert_Into_Query = function(list) {
            this.__list = list;
            this.__values = {};
            return this;
        };
        Insert_Into_Query.prototype = new Query();
        Insert_Into_Query.prototype.value = function(key, field) {
            this.__values[key] = field;
            return this;
        };
        Insert_Into_Query.prototype.execute = function() {
            var query = this;
            return new Promise(function(resolve, reject) {
                var clientContext = new SP.ClientContext(siteUrl);
                var list = clientContext.get_web().get_lists().getByTitle(query.__list);
                var itemInfo = new SP.ListItemCreationInformation();
                var item = list.addItem(itemInfo);
                query.packItem(item);
                item.update();
                clientContext.load(item);
                clientContext.executeQueryAsync(function(sender, args) {
                    resolve(query.unpackItem(item));
                }, function(sender, args) {
                    reject(args);
                });
            });
        };
        var Where_Query = function(query, field) {
            this.__query = query;
            this.__field = field;
            this.__value = "";
            this.__operator = "";
        };
        Where_Query.prototype.equals = function(value) {
            this.__operator = "equals";
            this.__value = value;
            return this.__query;
        };

        Where_Query.prototype.push = function(caml) {
            caml.push('<Query>');
            caml.push('<Where>');
            switch (this.__operator) {
                case "equals":
                    caml.push('<Eq>');
                    break;
            }
            caml.push('<FieldRef Name="' + this.__field + '"/>');
            caml.push('<Value Type="Number">' + this.__value + '</Value>');
            switch (this.__operator) {
                case "equals":
                    caml.push('</Eq>');
                    break;
            }
            caml.push('</Where>');
            caml.push('</Query>');
        };

        //select("test").and().where("test").equals("dis").and("ID").greater(4).end_and().execute();
        return {
            setSiteUrl: function(url) {
                siteUrl = url;
            },
            $get: function() {
                return ({
                    select: function(from, fields) {
                        return new Select_Query(from, fields);
                    },
                    update: function(list) {
                        return new Update_Query(list);
                    },
                    insertInto: function(list) {
                        return new Insert_Into_Query(list);
                    }
                });
            }
        };
    });