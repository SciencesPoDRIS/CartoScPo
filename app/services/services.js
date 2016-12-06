'use strict';

angular.module('bib.services', [])
.config(function ($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
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
