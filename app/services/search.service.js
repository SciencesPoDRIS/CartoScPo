/* global lunr */
'use strict';

angular.module('bib.services')
.factory('searchService', function ($q, metadataService, centerService) {
  var svc = {};

  var indexableFieldsP = metadataService.getIndexableFields();
  var fieldsAndCentersP = $q.all([
    centerService.getAll(),
    indexableFieldsP
  ]);
  $q.all([
    indexableFieldsP.then(buildSearchIndex),
    fieldsAndCentersP.then(_.spread(buildDocs))
  ])
  .then(_.spread(fillSearchIndex))
  .then(function (searchIndex) {
    svc.searchIndex = searchIndex;
  });

  function buildSearchIndex (fields) {
    return lunr(function() {
      // add fields needed for fulltext
      fields.forEach(function (f) { this.field(f); }.bind(this));
      this.ref('id');
    });
  }

  // center objects are deep and huge
  // so we transform them in more practical docs to be indexed by lunr
  function buildDocs (centers, fields) {
    return centers.map(function (center) {
      return Object.keys(center).reduce(function (doc, topic) {
        fields.forEach(function (field) {
          if (center[topic][field]) {
            doc[field] = center[topic][field];
          }
        });
        return doc;
      }, { id: center.id });
    });
  }

  function fillSearchIndex (searchIndex, docs) {
    docs.forEach(function (doc) {
      searchIndex.add(doc);
    });
    return searchIndex;
  }

  // public API
  svc.search = function (query, options) {
    options = options || {};
    return this.searchIndex.search(query, options);
  };

  svc.getCenters = function (query) {
    if (!query) return centerService.getAll();

    var results = this.search(query);
    return centerService.getAll().then(function (centers) {
      return results.map(function (result) {
        return _.find(centers, { id: result.ref });
      });
    });
  };

  return svc;
})

