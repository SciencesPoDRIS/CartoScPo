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
.factory('facetService', function ($q, centerService) {
  // TODO put this in a config
  var facets = {
    city: {
      id: 'city',
      path: 'administration',
      key: 'Ville'
    },
    attach: {
      id: 'attach',
      path: 'administration',
      key: 'Etablissements de rattachement'
    },
    keywords: {
      id: 'keywords',
      path: 'recherche',
      key: 'Mots-clés sujet  selon l\'annuaire du MENESR'
    },
    cnrs: {
      id: 'cnrs',
      path: 'recherche',
      key: 'Sections CNRS'
    },
    hal: {
      id: 'hal',
      path: 'publication',
      key: 'Publications versées dans HAL (oui/non)'
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
      return centerService.get().then(function (centers) {
        return _.uniq(Object.keys(centers).map(function (centerId) {
          var path = facets[facetId].path;
          var key = facets[facetId].key;
          return centers[centerId][path][key];
        }));
      });
    }
  };
})
;

