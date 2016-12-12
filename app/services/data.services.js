/* global elasticlunr */
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
.factory('searchService', function ($q, metadataService, centerService) {
  var searchIndex;

  var indexableFieldsP = metadataService.getIndexableFields();
  var fieldsAndCentersP = $q.all([
    centerService.getAll(),
    indexableFieldsP
  ]);
  $q.all([
    indexableFieldsP.then(buildSearchIndex),
    fieldsAndCentersP.then(_.spread(buildDocs))
  ])
  .then(_.spread(fillSearchIndex));

  // elaticlunr instead of regular lunr so we can query by field later
  function buildSearchIndex (fields) {
    // TODO remove global
    searchIndex = lunr(function() {
      // add fields needed for fulltext and the ones needed by facets
      fields.forEach(function (f) {
        this.field(f);
      }.bind(this));
      this.ref('id');
    });
    return searchIndex;
  }

  // TODO refactor
  // center objects are deep and huge
  // so we transform them in more practical docs to be indexed by lunr
  function buildDocs (centers, fields) {
    return Object.keys(centers).map(function (centerId) {
      var center = centers[centerId];
      var doc = { id: centerId };
      Object.keys(center).forEach(function (topic) {
        fields.forEach(function (field) {
          if (center[topic][field]) {
            doc[field] = center[topic][field];
          }
        });
      });
      return doc;
    });
  }

  function fillSearchIndex (searchIndex, docs) {
    docs.forEach(function (doc) {
      searchIndex.add(doc);
    });
    return searchIndex;
  }

  return {
    // options can be used to search on a specific field with bools
    search: function (query, options) {
      options = options || {};
      return searchIndex.search(query, options);
    }
  };
})
.factory('centerService', function (dataService) {
  return {
    getAll: function () {
      return dataService.get().then(function (data) {
        return data.allCenters;
      });
    }
  };
})
