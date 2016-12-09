/* global lunr */
'use strict';

angular.module('bib.services')
// TODO merge with fileService ?
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
    attach: {
      id: 'attach',
      path: 'administration',
      key: 'Etablissements de rattachement',
      type: 'multi',
      parser: parsers['*']
    },
    keywords: {
      id: 'keywords',
      path: 'recherche',
      key: 'Mots-clés sujet  selon l\'annuaire du MENESR',
      type: 'multi',
      parser: parsers['*']
    },
    cnrs: {
      id: 'cnrs',
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

