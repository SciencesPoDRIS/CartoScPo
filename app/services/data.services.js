/* global lunr */
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
})
.factory('searchService', function (dataService) {
  var searchIndex;
  dataService.get().then(function (data) {
    searchIndex = lunr(function() {
      this.field('content', { boost: 10 });
      this.ref('id');
    });

    data.allProps.forEach(function(p) {
      searchIndex.add(p);
    });
  });

  return {
    search: function (query) {
      return searchIndex.search(query, {
        fields: {
          content: { boost: 2 }
        },
        bool: 'AND',
        expand: false
      });
    }
  };
});

