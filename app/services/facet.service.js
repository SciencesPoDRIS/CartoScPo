/* global angular, _ */
'use strict';

angular
  .module('bib.services')
  .factory('facetService', function($q, $filter, metadataService, location) {
    /* this object describes the fields available in the sidebar
     * - id has to be unique
     * - path and key indictates when to grab the info in data.json
     * - type multi / boolean
     * - parser (optional) function to clean data if not already done during csv parsing
     */

    var parsers = {
      // example Toulouse;\nToulouse
      ';': function(items) {
        if (typeof items !== 'string') return [];
        return items.split(';').map($filter('trimNL'));
      },
      // example * CNRS\n* Sciences Po
      '*': function(items) {
        if (typeof items !== 'string') return [];
        return items.split('*').map($filter('trimNL'));
      }
    };

    // TODO: label could be deduced from schema.json

    // label = label
    // multievaluation || type === 'check-list' || type === 'array' || type === 'boolean-item' → type = 'multi'
    // multievaluation || type === 'check-list' → parsers['*']

    var facetsP = metadataService.getAll().then(function(fields) {
      return fields.reduce(function(list, field) {
        if (field.facet) {
          var facet = {
            id: field.id,
            label: field.facetLabel || field.label
          };
          if (field.type === 'array' || field.type === 'boolean-item') {
            facet.type = 'multi';
            facet.parser = function(values) {
              return values.map(function(value) {
                return value[field.facet];
              });
            };
          } else if (field.multievaluation || field.type === 'check-list') {
            facet.type = 'multi';
            facet.parser = field.multievaluation ? parsers['*'] : null;
          }
          list.push(facet);
        }
        return list;
      }, []);
    });

    function _getEnabledItemsFromLocation() {
      var enabled = [];
      _.each(location.search(), function(v, id) {
        if (_.isArray(v)) {
          _.each(v, function(label) {
            enabled.push({ facetId: id, label: label });
          });
        } else {
          enabled.push({ facetId: id, label: v });
        }
      });
      return enabled;
    }

    return {
      // all toggled facet items will be pushed / removed from this array
      enabledItems: _getEnabledItemsFromLocation(),

      getFacets: function() {
        return facetsP;
      },

      getAll: function(centers) {
        var self = this;
        return self.getFacets().then(function(facets) {
          return $q.all(
            facets.map(function(facet) {
              return self.getItems(facet.id, centers).then(function(items) {
                facet.items = items;
                return facet;
              });
            })
          );
        });
      },

      // example for the city facet: { label: 'Toulouse', 'count': 2, enabled: false }
      getItems: function(facetId, centers) {
        var self = this;
        return self.getFacets().then(function(facets) {
          var facet = _.find(facets, { id: facetId });
          if (!facet) {
            return [];
          }
          var items = _(centers)
            .flatMap(function(center) {
              var parser = facet.parser || _.identity;
              var value = parser(center[facet.id]);
              return facet.type === 'multi'
                ? // in case of [Toulouse, Toulouse]
                _.uniq(value)
                : // boolean (oui / non)
                value;
            })
            // clean empty values
            .filter(_.identity)
            // compute count
            .groupBy(_.identity)
            .mapValues(_.property('length'))
            .toPairs()
            .sortBy(_.property(1))
            .reverse()
            .map(
              _.spread(function(label, count) {
                var enabled = Boolean(
                  _.find(self.enabledItems, { facetId: facetId, label: label })
                );
                return {
                  label: label,
                  count: count,
                  enabled: enabled
                };
              })
            )
            .value();

          return items;
        });
      },

      updateLocation: function() {
        location.skipReload().search(
          _.reduce(
            this.enabledItems,
            function(q, i) {
              if (!q[i.facetId]) {
                q[i.facetId] = [];
              }
              q[i.facetId].push(i.label);
              return q;
            },
            {}
          )
        );
      },

      // when the user click on a facet item
      toggleItem: function(facet, item) {
        var stored = { facetId: facet.id, label: item.label };
        _.find(this.enabledItems, stored)
          ? _.remove(this.enabledItems, function(i) {
            return i.facetId === facet.id && i.label === item.label;
          })
          : this.enabledItems.push(stored);
        this.updateLocation();
      },

      reset: function() {
        this.enabledItems = [];
        this.updateLocation();
      },

      // take a list of centers and return only the "faceted" ones
      getCenters: function(centers) {
        var self = this;
        if (!self.enabledItems.length) return centers;

        return self.getFacets().then(function(facets) {
          return centers.filter(function(center) {
            return self.enabledItems.every(function(item) {
              var facet = _.find(facets, { id: item.facetId });
              var parser = facet.parser || _.identity;
              var value = parser(center[facet.id]);
              return value.indexOf(item.label) !== -1;
            });
          });
        });
      }
    };
  });
