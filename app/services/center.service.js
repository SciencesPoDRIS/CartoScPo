'use strict';

angular.module('bib.services')
.factory('centerService', function (dataService) {
  return {
    getAll: function () {
      return dataService.get().then(function (data) {
        // TODO this conversion Obj → Array could be done during paring
        return _.map(data.allCenters, function (center, centerId) {
          center.id = centerId;
          return center;
        });
      });
    },

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

