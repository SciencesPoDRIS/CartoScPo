'use strict';

angular.module('bib.services')
.factory('dataService', function ($q, fileService) {
  var url = './data/data.json?ver=' + Math.floor(Date.now() / 1000);
  var cache;

  return {
    get: function () {
      return cache ? $q.when(cache) : fileService.get(url).then(function (data) {
        cache = data;
        return data;
      });
    }
  };
})
.factory('autocompleteService', function(dataService) {
  return {
    getWords: function() {
      return dataService.get().then(function (data) {
        return data.allWords;
      });
    }
  };
})
;
