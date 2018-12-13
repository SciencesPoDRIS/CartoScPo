'use strict';

angular.module('bib.components').component('centerList', {
  templateUrl: 'views/center-list.html',
  bindings: {
    centers: '<',
    // expanded details
    expandedCenters: '='
  },
  controller: function($scope) {
    this.toogleCenter = function(centerId) {
      if ($scope.$ctrl.expandedCenters.indexOf(centerId) !== -1) {
        $scope.$ctrl.expandedCenters = [];
      } else {
        $scope.$ctrl.expandedCenters = [centerId];
      }
    };
  }
});
