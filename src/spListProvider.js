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
            this.list = list;
            this.fields = fields;
            this.where = null;
            this.limit = null;
        };
        Select_Query.prototype.where = function(field) {
            this.where = new Where_Query(this, field);
            return this.where;
        };
        Select_Query.prototype.limit = function(amount) {
            this.limit = amount;
        };
        Select_Query.prototype.execute = function() {
            var query = this;
            return $q(function(resolve, reject) {
                var clientContext = new SP.ClientContext(siteUrl);
                var list = clientContext.get_web().get_lists().getByTitle(query.list);
                var camlQuery = new SP.CamlQuery();
                var caml = ['<View>'];
                if (query.where !== null) {
                    query.where.push(caml);
                }
                caml.push('<ViewFields>');
                query.fields.forEach(function(field) {
                    caml.push('<FieldRef Name="' + field + '"/>');
                });
                caml.push('</ViewFields>');
                if (limit !== null) {
                    caml.push('<RowLimit>' + limit + '</RowLimit>');
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
            this.query = query;
            this.field = field;
            this.value = "";
            this.operator = "";
        };
        Where_Query.prototype.equals = function(value) {
            this.operator = "equals";
            this.value = value;
            return this.query;
        };

        Where_Query.prototype.push = function(caml) {
            caml.push('<Query>');
            caml.push('<Where>');
            switch (this.operator) {
                case "equals":
                    caml.push('<Eq>');
                    break;
            }
            caml.push('<FieldRef Name="' + this.field + '"/>');
            caml.push('<Value Type="Number">' + this.value + '</Value>');
            switch (this.operator) {
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