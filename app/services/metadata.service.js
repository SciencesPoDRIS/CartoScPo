'use strict';

angular
  .module('bib.services')
  .factory('metadataService', function(
    $q,
    $http,
    fileService,
    backOfficeBaseUrl
  ) {
    var cache;

    // To be bound to field
    function bindableGetFieldSearchableContent(center) {
      var data = center[this.id];
      if (!_.isArray(data)) {
        return null;
      }
      return this.searchable
        .map(function(subId) {
          return data
            .map(function(content) {
              return content[subId];
            })
            .join(' ');
        })
        .join(' ');
    }

    function buildSearchableFields(fields) {
      return fields.reduce(function(result, field) {
        if (field.searchable) {
          if (
            (field.type === 'array' || field.type === 'boolean-item') &&
            _.isArray(field.searchable)
          ) {
            // Composite
            field.getSearchableContent = bindableGetFieldSearchableContent;
          }
          result.push(field);
        }
        return result;
      }, []);
    }

    return {
      // raw collection
      getAll: function() {
        return cache
          ? $q.resolve(cache)
          : $http
            .get(`${backOfficeBaseUrl}/schema.json`)
            .then(function(res) {
              return res.data;
            })
            .then(function(data) {
              var fields = Object.keys(data.properties).map(function(k) {
                data.properties[k].id = k;
                return data.properties[k];
              });
              cache = fields;
              return fields;
            });
      },

      // used by the master search input
      getSearchableFields: function() {
        return this.getAll().then(buildSearchableFields);
      },

      // searchable + facets
      getIndexableFields: function() {
        return this.getSearchableFields();
      }
    };
  });
