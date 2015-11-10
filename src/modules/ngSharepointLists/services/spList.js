angular
    .module('ngSharepoint.Lists')
    .factory('$spList', ['SPList', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function (SPList, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
              return new SPList(title);
            },
            select: function(fields) {
                return new SelectQuery(fields);
            },
            update: function(list) {
                return new UpdateQuery(list);
            },
            insertInto: function(list) {
                return new InsertIntoQuery(list);
            },
            delete: function() {
                return new DeleteQuery();
            }
        });
    }])
    .factory('SPList', ['$q', '$http', '$sp', '$spLog', '$spCamlParser', function($q, $http, $sp, $spLog, $spCamlParser) {
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
        if ($sp.getConnectionMode() == "JSOM") {
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
      //RestSPList
      var RestSPList = function(title) {
        this.title = title;
      };
      RestSPList.prototype.select = function(query) {
        var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/GetItems";
        var body = {
          query: {
            __metadata: {
              type: "SP.CamlQuery"
            },
            ViewXml: query.build()
          }
        };
        var headers = {
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "Accept": "application/json; odata=verbose",
          "Content-Type": "application/json; odata=verbose"
        };
        return $q(function(resolve, reject) {
          $http({
            method: 'POST',
            url: $sp.getSiteUrl() + endpoint,
            data: body,
            headers: headers
          }).then(function(data) {
            //TODO: Parse Result
          }, reject);
        });
      };
      RestSPList.prototype.insert = function(data) {
        var endpoint = "_api/web/Lists/GetByTitle('" + this.title + "')/items";
        var body = {
          __metadata: {
            type: 'SP.Data.TestListItem'
          }
        };
        var headers = {
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "Accept": "application/json; odata=verbose",
          "Content-Type": "application/json; odata=verbose"
        };
        Object.getOwnPropertyNames(data).forEach(function(key) {
          var value = data[key];
          if (value !== null && value !== undefined && typeof value == 'string') {
            value = value.trim();
          }
          body[key] = value;
        });
        return $q(function(resolve, reject) {
          $http({
            method: 'POST',
            url: $sp.getSiteUrl() + endpoint,
            data: body,
            headers: headers
          }).then(function(data) {
            //TODO: Parse Result
          }, reject);
        });
      };
      RestSPList.prototype.delete = function(query) {
        //TODO: Implement
      };
      RestSPList.prototype.update = function(query, data) {
        //TODO: Implement
      };
      //JsomSPList
      var JsomSPList = function(title) {
        this.title = title;
      };
      JsomSPList.prototype.select = function(query) {
        return $q(function(resolve, reject) {
          var context = $sp.getContext();
          var list = context.get_web().get_lists().getByTitle(this.title);
          var camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(query);
          var items = list.getItems(camlQuery);
          context.load(items);
          context.executeQueryAsync(function() {
            var result = [];
            var itemIterator = items.getEnumerator();
            while (itemIterator.moveNext()) {
              var item = itemIterator.get_current();
              result.push(list.__unpack(item, $spCamlParser.parse(query).getViewFields()));
            }
            resolve(result);
          }, function(sender, args) {
            reject(args);
          });
        });
      };
      JsomSPList.prototype.insert = function(data) {
        var list = this;
        return $q(function(resolve, reject) {
          var clientContext = $sp.getContext();
          var list = clientContext.get_web().get_lists().getByTitle(list.title);
          var itemInfo = new SP.ListItemCreationInformation();
          var item = list.addItem(itemInfo);
          list.__pack(item, data);
          item.update();
          clientContext.load(item);
          clientContext.executeQueryAsync(function(sender, args) {
              resolve(data);
          }, function(sender, args) {
              reject(args);
          });
        });
      };
      JsomSPList.prototype.delete = function(query) {
        var list = this;
        return $q(function(resolve, reject) {
          var clientContext = $sp.getContext();
          var list = clientContext.get_web().get_lists().getByTitle(list.title);
          var camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(query);
          var items = list.getItems(camlQuery);
          clientContext.load(items);
          clientContext.executeQueryAsync(
              function(sender, args) {
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
              }
          );
        });
      };
      JsomSPList.prototype.update = function(query, data) {
        var list = this;
        return $q(function(resolve, reject) {
          var clientContext = $sp.getContext();
          var list = clientContext.get_web().get_lists().getByTitle(query.__list);
          var camlQuery = new SP.CamlQuery();
          camlQuery.set_viewXml(query);
          var items = list.getItems(camlQuery);
          clientContext.load(items);
          clientContext.executeQueryAsync(function(sender, args) {
            var itemIterator = items.getEnumerator();
            while (itemIterator.moveNext()) {
              var item = itemIterator.get_current();
              list.__pack(item, data);
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
      JsomSPList.prototype.__pack = function(item, data) {
        Object.getOwnPropertyNames(data).forEach(function(key) {
          var value = data[key];
          if (value !== null && value !== undefined && typeof value == 'string') {
            value = value.trim();
          }
          item.set_item(key, value);
        });
      };
      JsomSPList.prototype.__unpack = function(item, fields) {
        var query = this;
        var obj = {};
        var cols = fields;
        if (!Array.isArray(fields)) {
          cols = Object.getOwnPropertyNames(fields);
        }
        cols.forEach(function(key) {
            var value = item.get_item(key);
            if (value !== null && value !== undefined && typeof value == 'string') {
              value = value.trim();
            }
            obj[key] = value;
        });                
        return obj;
      };
      return (SPList);
    }]);
