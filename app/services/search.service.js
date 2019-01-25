/* global lunr */
'use strict';

angular
  .module('bib.services')
  .factory('searchService', function($q, metadataService, centerService) {
    var svc = {};

    // build the search index
    var indexableFieldsP = metadataService.getIndexableFields();
    var fieldsAndCentersP = $q.all([centerService.getAll(), indexableFieldsP]);
    $q.all([
      indexableFieldsP.then(buildSearchIndex),
      fieldsAndCentersP.then(_.spread(buildDocs))
    ])
      .then(_.spread(fillSearchIndex))
      .then(function(searchIndex) {
        svc.searchIndex = searchIndex;
      });

    // add fields
    function buildSearchIndex(fields) {
      return lunr(function() {
        // Allows adding docs later, out of the builder context
        svc.addDoc = this.add.bind(this);
        // add fields needed for fulltext
        fields.forEach(
          function(f) {
            this.field(f.id);
          }.bind(this)
        );
        this.ref('id');
      });
    }

    // center objects are deep and huge
    // so we transform them in more practical docs to be indexed by lunr
    function buildDocs(centers, fields) {
      return centers.map(function(center) {
        return Object.keys(center).reduce(
          function(doc) {
            fields.forEach(function(field) {
              var value = field.getSearchableContent
                ? field.getSearchableContent(center)
                : center[field.id];
              if (value) {
                doc[field.id] = value;
              }
            });
            return doc;
          },
          { id: center.id }
        );
      });
    }

    // feed index with docs (lightweigtht centers)
    function fillSearchIndex(searchIndex, docs) {
      docs.forEach(function(doc) {
        svc.addDoc(doc);
      });
      return searchIndex;
    }

    svc.search = function(query, options) {
      options = options || {};
      return this.searchIndex.search(query, options);
    };

    // retrieve filtered centers according to query
    svc.getCenters = function(query) {
      if (!query) return centerService.getAll();

      var results = this.search(query);
      return centerService.getAll().then(function(centers) {
        return results.map(function(result) {
          return _.find(centers, { id: result.ref });
        });
      });
    };

    return svc;
  });
