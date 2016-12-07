'use strict';

angular.module('bib.services')
.factory('fileService', function($http) {
  return {
    get: function(file) {
      return $http.get(file, {
        headers : {
          'Pragma': 'no-cache',
          'Expires': -1,
          'Cache-Control': 'no-cache'
        },
        cache: false
      }).then(function (res) { return res.data; });
    }
  };
});
