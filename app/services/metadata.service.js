'use strict';

angular.module('bib.services')
.factory('metadataService', function ($q, $http, fileService, facetService, backOfficeHost, backOfficePort) {
  var url = './data/metadata.json?ver=' + Math.floor(Date.now() / 1000);
  var cache;

  return {
    // raw collection
    getAll: function () {
      return cache ? $q.resolve(cache) : $http.get(`${backOfficeHost}:${backOfficePort}/schema.json`)
      .then(function(res) { return res.data })
      .then(function (data) {
        var fields = Object.keys(data.properties).map(function (k) {
          data.properties[k].id = k
          return data.properties[k]
        })
        cache = fields
        return fields;
      });
    },

    // used by the master search input
    getSearchableFields: function () {
      return this.getAll().then(function (fields) {
        return fields.filter(function (field) {
          return field.searchable
        });
      });
    },

    // used in the sidebar
    getFacetFields: function () {
      return $q.resolve(facetService.facets.map(function (f) {
        return f.id;
      }));
    },

    // searchable + facets
    getIndexableFields: function () {
      return this.getSearchableFields()
    }
  };
});

