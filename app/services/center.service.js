'use strict';

angular.module('bib.services')
.factory('centerService', function (dataService) {
  return {

    // retrieve info from data.json
    getAll: function () {
      return dataService.get().then(function (data) {
        return data.centers
      });
    },

    // turn each center object into a shallow version to be used in ui-grid
    // for example each key under "publication" are assigned to the root
    gridify: function (centers) {
      return centers.map(function (center) {
        return Object.keys(center).reduce(function (acc, topic) {
          if (topic === 'id') return acc;
          return _.assign(acc, center[topic]);
        }, {});
      });
    }
  };
});

