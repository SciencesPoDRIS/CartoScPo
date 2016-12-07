'use strict';

angular.module('bib.services')
// TODO merge with fileService ?
.factory('dataService', function (fileService) {
  var url = './data/data.json?ver=' + Math.floor(Date.now() / 1000);
  return {
    get: function () {
      return fileService.get(url);
    }
  };
})
.factory('autocompleteService', function(dataService) {
  return {
    get: function() {
      return dataService.get().then(function (data) {
        return data.allWords;
      });
    }
  };
});

