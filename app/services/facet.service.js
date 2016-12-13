'use strict';

angular.module('bib.services')
.factory('facetService', function ($filter) {
  /* this object describes the fields available in the sidebar
  * - id has to be unique
  * - path and key indictates when to grab the info in data.json
  * - type multi / boolean
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

    // all toggled facet items will be pushed / removed from this array
    enabledItems: [],

    getAll: function (centers) {
      return facets.map(function (facet) {
        facet.items = this.getItems(facet.id, centers);
        return facet;
      }.bind(this));
    },

    // example for the city facet: { label: 'Toulouse', 'count': 2, enabled: false }
    getItems: function (facetId, centers) {
      var facet = _.find(facets, {id: facetId});
      var items = _(centers)
        .flatMap(function (center) {
          var parser = facet.parser || _.identity;
          var value = parser(center[facet.path][facet.key]);
          return facet.type === 'multi'
            // in case of [Toulouse, Toulouse]
            ? _.uniq(value)
            // boolean (oui / non)
            : value;
        })
        // clean empty values
        .filter(_.identity)
        // compute count
        .groupBy(_.identity)
        .mapValues(_.property('length'))
        .toPairs()
        .sortBy(_.property(1))
        .reverse()
        .map(_.spread(function (label, count) {
          var enabled = Boolean(_.find(this.enabledItems, { facetId: facetId, label: label }));
          return {
            label: label,
            count: count,
            enabled: enabled
          };
        }.bind(this)))
        .value();

      return items;
    },

    // when the user click on a facet item
    toggleItem: function (facet, item) {
      var stored = { facetId: facet.id, label: item.label };
      _.find(this.enabledItems, stored)
        ? _.remove(this.enabledItems, function (i) {
          return i.facetId === facet.id && i.label === item.label;
        })
        : this.enabledItems.push(stored);
    },

    reset: function () {
      this.enabledItems = [];
    },

    // take a list of centers and return only the "faceted" ones
    getCenters: function (centers) {
      if (!this.enabledItems.length) return centers;

      return centers.filter(function (center) {
        return this.enabledItems.every(function (item) {
          var facet = _.find(facets, {id: item.facetId});
          var parser = facet.parser || _.identity;
          var value = parser(center[facet.path][facet.key]);
          return value.indexOf(item.label) !== -1;
        }, this);
      }, this);
    }
  };
})
;


