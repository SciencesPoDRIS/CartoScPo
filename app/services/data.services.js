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
.factory('metadataService', function ($q, fileService) {
  var url = './data/metadata.json?ver=' + Math.floor(Date.now() / 1000);
  var cache;
  var searchableTypes = ['String', 'Markdown'];

  return {
    get: function () {
      return cache ? $q.when(cache) : fileService.get(url).then(function (data) {
        cache = data;
        return data;
      });
    },

    getSearchableFields: function () {
      return this.get().then(function (fields) {
        return fields.filter(function (field) {
          return searchableTypes.indexOf(field['Saisie : string, number, liste ou markdown']) !== -1;
        });
      });
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
    // elaticlunr instead of regular lunr so we can query by field
    searchIndex = elasticlunr(function() {
      this.setRef('id');
      this.addField('content', { boost: 10 });
    });

    data.allProps.forEach(function(p) {
      searchIndex.addDoc(p);
    });
  });

  return {
    // options can be used to search on a specific field
    search: function (query, options) {
      options = options || {};
      return searchIndex.search(query, options);
    }
  };
})
.factory('centerService', function (dataService) {
  return {
    get: function () {
      return dataService.get().then(function (data) {
        return data.allCenters;
      });
    }
  };
})
.factory('facetService', function ($filter, $q, centerService) {
  /* TODO put this in a config
  * this object describes the fields available in the sidebar
  * - id has to be unique
  * - path and key indictates when to grab the info in data.json
  * - type multi (ui-select) / boolean (checkbox triple state)
  * - parser (optional) function to clean data if not already done during csv parsing
  */

  var parsers = {
    // example Toulouse;\nToulouse
    ';': function (items) {
      return items.split(';').map($filter('trimNL'));
    },
    // example * CNRS\n* Sciences Po
    '*': function (items) {
      return items.split('*').map($filter('trimNL'));
    }
  };

  var facets = {
    city: {
      id: 'city',
      path: 'administration',
      key: 'Ville',
      type: 'multi',
      parser: parsers[';']
    },
    affiliation: {
      id: 'affiliation',
      path: 'administration',
      key: 'Etablissements de rattachement',
      type: 'multi',
      parser: parsers['*']
    },
    subject_terms: {
      id: 'subject_terms',
      path: 'recherche',
      key: 'Mots-clés sujet  selon l\'annuaire du MENESR',
      type: 'multi',
      parser: parsers['*']
    },
    cnrs_sections: {
      id: 'cnrs_sections',
      path: 'recherche',
      key: 'Sections CNRS',
      type: 'multi',
      parser: parsers['*']
    },
    hal: {
      id: 'hal',
      path: 'publication',
      key: 'Publications versées dans HAL (oui/non)',
      type: 'boolean'
    }
  };

  return {
    get: function () {
      return $q.all(_.values(facets).map(function (facet) {
        return this.getItems(facet.id).then(function (items) {
          facet.items = items;
          return facet;
        });
      }.bind(this)));
    },

    getItems: function (facetId) {
      var facet = facets[facetId];
      return centerService.get().then(function (centers) {
        var items = Object.keys(centers).map(function (centerId) {
          var parser = facet.parser || _.identity;
          return parser(centers[centerId][facet.path][facet.key]);
        });
        return _.uniq(_.flatten(items)).sort();
      });
    }
  };
})
;

