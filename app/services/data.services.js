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
    searchIndex = elasticlunr(function() {
      // add fields needed for fulltext and the ones needed by facets
      fields.forEach(function (f) {
        this.addField(f);
      }.bind(this));
      this.setRef('id');
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
      searchIndex.addDoc(doc);
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

  var facets = [
    {
      id: 'city',
      path: 'administration',
      key: 'Ville',
      type: 'multi',
      parser: parsers[';']
    },
    {
      id: 'affiliation',
      path: 'administration',
      key: 'Etablissements de rattachement',
      type: 'multi',
      parser: parsers['*']
    },
    {
      id: 'subject_terms',
      path: 'recherche',
      key: 'Mots-clés sujet  selon l\'annuaire du MENESR',
      type: 'multi',
      parser: parsers['*']
    },
    {
      id: 'cnrs_sections',
      path: 'recherche',
      key: 'Sections CNRS',
      type: 'multi',
      parser: parsers['*']
    },
    {
      id: 'hal',
      path: 'publication',
      key: 'Publications versées dans HAL (oui/non)',
      type: 'boolean'
    }
  ];

  return {
    facets: facets,

    getAll: function () {
      return $q.all(facets.map(function (facet) {
        return this.getItems(facet.id).then(function (items) {
          facet.items = items;
          return facet;
        });
      }.bind(this)));
    },

    // example for the city facet: Toulouse, Paris, Brest…
    getItems: function (facetId) {
      var facet = _.find(facets, {id: facetId});
      return centerService.getAll().then(function (centers) {
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

