angular
    .module('ngSharepoint', [])
    .provider('$spList', function () {
        var siteUrl = "";
        var default_limit = 500;
        /*
        @param list    The List to run the query on
        @param fields  An Array of fields to query
        */
        var Select_Query = function(list, fields) {
            this.__list = list;
            this.__fields = fields;
            this.__where = null;
            this.__limit = null;
            return this;
        };
        Select_Query.prototype.where = function(field) {
            this.__where = new Where_Query(this, field);
            return this.__where;
        };
        Select_Query.prototype.limit = function(amount) {
            this.__limit = amount;
        };
        Select_Query.prototype.execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = new SP.ClientContext(siteUrl);
                var list = clientContext.get_web().get_lists().getByTitle(query.list);
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.__where !== null) {
                    query.__where.push(caml);
                }
                caml.push('<ViewFields>');
                query.__fields.forEach(function(field) {
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
                        resolve(args);
                    },
                    function(sender, args) {
                        reject(args);
                    }
                );
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
                    }
                });
            }
        };
    });