'use strict';

angular.module('bib.components').component('centerList', {
  templateUrl: 'views/center-list.html',
  bindings: {
    centers: '<',
    // expanded details
    expandedCenters: '='
  },
  controller: function($rootScope, $scope, location) {
    this.toggleCenter = function(centerId) {
      var ids = $scope.$ctrl.expandedCenters;
      var index = ids.indexOf(centerId);
      if (index !== -1) {
        $scope.$ctrl.expandedCenters = ids.filter(function(c) {
          return c !== centerId;
        });
      } else {
        $scope.$ctrl.expandedCenters = ids.concat([centerId]);
      }
      // Update URL (without reloading for UI perf)
      var ids2 = $scope.$ctrl.expandedCenters;
      var url =
        '/' +
        $rootScope.lang +
        (ids2.length === 0 ? '/centers' : `/centers/${ids2[ids2.length - 1]}`);
      location.skipReload().path(url);
    };
  }
});
