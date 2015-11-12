angular
	.module('ngSharepoint.Lists')
	.factory('SPList', ['$sp', '$spLog', 'RestSPList', 'JsomSPList', function($sp, $spLog, RestSPList, JsomSPList) {
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
        if ($sp.getConnectionMode() === "JSOM") {
          this.__list = new JsomSPList(title);
        }else {
          this.__list = new RestSPList(title);
        }
      };
      /**
       * @ngdoc function
       * @name  SPList#insert  
       * @param  {object} data The Data you wanna insert
       * @return {Promise}      A Promise which resolves when the insertion was sucessful
       */
      SPList.prototype.insert = function(data) {
        return this.__list.insert(data).catch($spLog.error);
      };
      /** 
       * @ngdoc function
       * @name  SPList#select
       * @param {SP.CamlQuery} query A CamlQuery to filter for
       * @return {Promise} A Promise which resolves to the selected data
       */
      SPList.prototype.select = function(query) {
        return this.__list.select(query).catch($spLog.error);
      };
      /**
       * @ngdoc function
       * @param  {SP.CamlQuery} query A CamlQuery to filter for
       * @return {Promise}       [description]
       */
      SPList.prototype.delete = function(query) {
        return this.__list.delete(query).catch($spLog.error);
      };
      /**
       * @ngdoc function
       * @param  {SP.CamlQuery} query  A CamlQuery which selects the rows to update
       * @param  {object} data The Data you wanna update 
       * @return {Promise}        A Promise which resolves when the update was sucessfull
       */
      SPList.prototype.update = function(query, data) {
        return this.__list.update(query, data).catch($spLog.error);
      };
      return (SPList);
	}]);