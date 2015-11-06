angular
    .module('ngSharepointLists')
    .factory('$spList', ['$sp', 'SelectQuery', 'UpdateQuery', 'InsertIntoQuery', 'DeleteQuery', function ($sp, SelectQuery, UpdateQuery, InsertIntoQuery, DeleteQuery) {
        return ({
            getList: function(title) {
              return null;
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
    .factory('SPList', ['$q', '$http', '$sp', function($q, $http, $sp) {
      var SPList = function(title) {
        this.title = title;
        if ($sp.getConnectionMode() == "JSOM") {
          this.__list = new JsomSPList(title);
        }else {
          this.__list = new RestSPList(title);
        }
      };
      SPList.prototype.insert = function(data) {
        return this.__list.insert(data);
      };
      SPList.prototype.select = function(query) {
        return this.__list.select(query);
      };
      SPList.prototype.delete = function(query) {
        return this.__list.delete(query);
      };
      var RestSPList = function() {
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
      var JsomSPList = function(title) {
        this.title = title;
      };
      JsomSPList.prototype.select = function(query) {
        return $q(function(resolve, reject) {
          var context = $sp.getContext();
          var list = context.get_web().get_lists().getByTitle(this.title);
          var items = list.getItems(query.build());
          context.load(items);
          context.executeQueryAsync(function() {
            var result = [];
            var itemIterator = items.getEnumerator();
            while (itemIterator.moveNext()) {
              var item = itemIterator.get_current();
              result.push(query.unpackItem(item));
            }
            resolve(result);
          }, function(sender, args) {
            reject(args);
          });
        });
      };
      return (SPList);
    }]);
