/* global lunr */
'use strict';

angular
  .module('bib.services')
  .factory('searchService', function($q, metadataService, centerService) {
    var index = null;

    // build the search index
    var indexableFieldsP = metadataService.getIndexableFields();
    var docsP = $q
      .all([centerService.getAll(), indexableFieldsP])
      .then(_.spread(buildDocs));
    $q.all([indexableFieldsP, docsP])
      .then(_.spread(buildSearchIndex))
      .then(function(searchIndex) {
        index = searchIndex;
      });

    // add fields
    function buildSearchIndex(fields, docs) {
      return lunr(function() {
        var self = this;
        // add fields needed for fulltext
        fields.forEach(function(f) {
          self.field(f.id);
        });
        self.ref('id');
        // add docs
        docs.forEach(function(doc) {
          self.add(doc);
        });
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

    return {
      // Search in indexed docs
      search: function(query, options) {
        options = options || {};
        return index ? index.search(query, options) : [];
      },

      // retrieve filtered centers according to query
      getCenters: function(query) {
        if (!query) return centerService.getAll();

        var results = this.search(query);
        return centerService.getAll().then(function(centers) {
          return results.map(function(result) {
            return _.find(centers, { id: result.ref });
          });
        });
      }
    };
  });
