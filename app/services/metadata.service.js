'use strict';

angular.module('bib.services')
.factory('metadataService', function ($q, fileService, facetService) {
  var url = './data/metadata.json?ver=' + Math.floor(Date.now() / 1000);
  var cache;
  var searchableTypes = ['String', 'Markdown'];

  return {
    // raw collection
    getAll: function () {
      return cache ? $q.when(cache) : fileService.get(url).then(function (data) {
        cache = data;
        return data;
      });
    },

    // used by the master search input
    getSearchableFields: function () {
      return this.getAll().then(function (fields) {
        return fields.filter(function (field) {
          return searchableTypes.indexOf(field['Saisie : string, number, liste ou markdown']) !== -1;
        });
      });
    },

    // used in the sidebar
    getFacetFields: function () {
      return $q.when(facetService.facets.map(function (f) {
        return f.key;
      }));
    },

    // searchable + facets
    getIndexableFields: function () {
      return $q.all([
        this.getSearchableFields(),
        this.getFacetFields()
      ]).then(function (args) {
        var searchables = args[0].map(function (f) { return f['Libellé FR']; });
        return _.uniq(searchables.concat(args[1]));
      });
    }
  };
});

