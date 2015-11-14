angular
    .module('ngSharepoint.Lists')
    .factory('SPList', ['$sp', '$spLog', 'CamlBuilder', 'RestSPList', 'JsomSPList', function($sp, $spLog, CamlBuilder, RestSPList, JsomSPList) {
        /**
        * @ngdoc object
        * @name  SPList
        * @param {string} title The List Title
        * 
        * @module  ngSharepoint.Lists
        *
        * @description
        * SPList represents a Sharepoint List
        */
        var SPList = function(title) {
            this.title = title;
            if ($sp.getConnectionMode() === 'JSOM') {
              this.__list = new JsomSPList(title);
            }else {
              this.__list = new RestSPList(title);
            }
        };
        /**
        * @ngdoc function
        * @name  SPList#create  
        * @param  {object} data The Data you wanna create
        * @return {Promise}      A Promise which resolves when the insertion was sucessful
        */
        SPList.prototype.create = function(data) {
            return this.__list.create(data).catch($spLog.error);
        };
        /** 
        * @ngdoc function
        * @name  SPList#read
        * @param {string} query A CamlQuery to filter for
        * @return {Promise} A Promise which resolves to the selected data
        */
        SPList.prototype.read = function(query) {
            return this.__list.read(query).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @param  {string} query  A CamlQuery which selects the rows to update
        * @param  {object} data The Data you wanna update 
        * @return {Promise}        A Promise which resolves when the update was sucessfull
        */
        SPList.prototype.update = function(query, data) {
            return this.__list.update(query, data).catch($spLog.error);
        };
        /**
        * @ngdoc function
        * @param  {string} query A CamlQuery to filter for
        * @return {Promise}       [description]
        */
        SPList.prototype.delete = function(query) {
            return this.__list.delete(query).catch($spLog.error);
        };
        /**
         * @ngdoc function
         * @param  {[type]} query [description]
         * @return {Promise}       [description]
         */
        SPList.prototype.query = function(query) {
            if (typeof query === 'object') {
                return this.__jsonQuery(query);
            }
        };
        SPList.prototype.__jsonQuery = function(query) {
            if (angular.isDefined(query.type)) {
                var builder = new CamlBuilder();
                builder.buildFromJson(query);
                switch (query.type) {
                    case 'create':
                        if (angular.isDefined(query.data)) {
                            return this.create(data);
                        }else {
                            throw "Query Data is not defined";
                        }
                        break;
                    case 'read':
                        return this.read(builder.build());
                    case 'update':
                        if (angular.isDefined(query.data)) {
                            return this.update(builder.build(), query.data);
                        }else {
                            throw "Query Data is not defined";
                        }
                        break;
                    case 'delete':
                        return this.delete(builder.build());
                }
            }else {
                throw "Query Type is not defined";
            }
        };
        return (SPList);
    }]);