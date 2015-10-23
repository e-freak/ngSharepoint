angular
	.module('ngSharepoint')
	.factory('WhereQuery', function() {
        var WhereQuery = function(query, field) {
            this.__query = query;
            this.__field = field;
            this.__value = "";
            this.__operator = "";
            //this.__query.__queries.where.push(this);
            this.__operators = {
                BEGINS_WITH: ['<BeginsWith>', '</BeginsWith>'],
                CONTAINS: ['<Contains>', '</Contains>'],
                EQUALS: ['<Eq>', '</Eq>'],
                GREATER_EQUALS: ['<Geq>', '</Geq>'],
                GREATER: ['<Gt>', '</Gt>'],
                INCLUDES: ['<Includes>', '</Includes>'],
                IS_NOT_NULL: ['<IsNotNull>', '</IsNotNull>'],
                IS_NULL: ['<IsNull>', '</IsNull>'],
                LESS_EQUALS: ['<Leq>', '</Leq>'],
                LESS: ['<Lt>', '</Lt>'],
                NOT_EQUALS: ['<Neq>', '</Neq>'],
                NOT_INCLUDES: ['<NotIncludes>', '</NotIncludes>']
            };
        };
        WhereQuery.prototype.equals = function(value) {
            this.__operator = "equals";
            this.__value = value;
            return this.__query;
        };
        WhereQuery.prototype.beginsWith = function(value) {
            this.__operator = this.__operators.BEGINS_WITH;
        };
        WhereQuery.prototype.push = function(caml) {
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
        return (WhereQuery);
	});