'use strict';

// this service is kind of agnostic
// it's currently in charge of retrieving data.json or metadata.json

angular.module('bib.services').factory('fileService', function($http) {
  return {
    get: function(file) {
      return $http
        .get(file, {
          headers: {
            Pragma: 'no-cache',
            Expires: -1,
            'Cache-Control': 'no-cache'
          },
          cache: false
        })
        .then(function(res) {
          return res.data;
        });
    }
  };
});
