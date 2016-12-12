angular.module('bib.services')
.factory('facetService', function ($filter, $q) {
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

    getAll: function (centers) {
      return facets.map(function (facet) {
        facet.items = this.getItems(facet.id, centers);
        return facet;
      }.bind(this));
    },

    // example for the city facet: { label: 'Toulouse', 'count': 2, enable: false }
    getItems: function (facetId, centers) {
      var facet = _.find(facets, {id: facetId});
      var items = _(centers)
        .map(function (center) {
          var parser = facet.parser || _.identity;
          return parser(center[facet.path][facet.key]);
        })
        .flatten()
        .filter(_.identity)
        .groupBy(_.identity)
        .mapValues(_.property('length'))
        .toPairs()
        .map(function (item) {
          return { label: item[0], count: item[1], enable: false };
        })
        .value();

      return items;
    }
  };
})
;


