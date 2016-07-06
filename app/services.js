'use strict';

/* Services */

angular.module('bib.services', [])
  .config(function ( $httpProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .factory('fileService', [ '$http', '$q', function($http, $q) {

   return {

     getFile : function(url) {
       var deferred = $q.defer();
       $http.get(url).success(function(data) {
         deferred.resolve(data);
       }).error(function(){
         deferred.reject('An error occured while fetching file');
       });

       return deferred.promise;
     }
   }
  }])
  .factory('dataTableService', function() {

   return {
     sortData : function(data, field, direction) {
      if (data) 
        data.sort(function (a, b) {
          if (direction === 'asc') 
            return a[field]> b[field]? 1 : -1;
          else 
            return a[field]> b[field]? -1 : 1;
        })
      }
    }
  })
  .factory('utils', function() {

    // Is the given value a plain JavaScript object
    function isPlainObject(value) {
      return value &&
             typeof value === 'object' &&
             !Array.isArray(value) &&
             !(value instanceof Date) &&
             !(value instanceof RegExp);
    }

    // Convert an object into an array of its properties
    function objectToArray(o, order) {
      order = order || Object.keys(o);

      return order.map(function(k) {
        return o[k];
      });
    }

    // Retrieve an index of keys present in an array of objects
    function keysIndex(a) {
      var keys = [],
          l,
          k,
          i;

      for (i = 0, l = a.length; i < l; i++)
        for (k in a[i])
          if (!~keys.indexOf(k))
            keys.push(k);

      return keys;
    }

    // Escape a string for a RegEx
    function rescape(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // Converting an array of arrays into a CSV string
    function toCSVString(data, params) {
      params = params || {};

      var header = params.headers || [],
          plainObject = isPlainObject(data[0]),
          keys = plainObject && (params.order || keysIndex(data)),
          oData,
          i;

      // Defaults
      var escape = params.escape || '\'',
          delimiter = params.delimiter || ',';

      // Dealing with headers polymorphism
      if (!header.length)
        if (plainObject && params.headers !== false)
          header = keys;

      // Should we append headers
      oData = (header.length ? [header] : []).concat(
        plainObject ?
          data.map(function(e) { return objectToArray(e, keys); }) :
          data
      );

      // Converting to string
      return oData.map(function(row) {
        return row.map(function(item) {

          // Wrapping escaping characters
          var i = ('' + (typeof item === 'undefined' || item === null ? '' : item)).replace(
            new RegExp(rescape(escape), 'g'),
            escape + escape
          );

          // Escaping if needed
          return ~i.indexOf(delimiter) || ~i.indexOf(escape) || ~i.indexOf('\n') ?
            escape + i + escape :
            i;
        }).join(delimiter);
      }).join('\n');
    }

    function downloadCSV(data, headers, order, fileName) {
      var csv = toCSVString(data, {headers: headers, order: order}),
          blob = new Blob([csv], {type: 'attachment/csv;charset=utf-8'}),
          dataUrl = URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.style.display = 'none';
      a.setAttribute('href', dataUrl);
      document.body.appendChild(a);
      a.setAttribute('download', fileName + '.csv');
      a.click();
      document.body.removeChild(a);

      // a = null;
      // URL.revokeObjectURL(dataUrl);
    }

    return {
      downloadCSV: downloadCSV,
      toCSVString: toCSVString
    };
  });