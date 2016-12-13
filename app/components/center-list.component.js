'use strict';

angular.module('bib.components')
.component('centerList', {
  templateUrl: 'views/center-list.html',
  bindings: {
    centers: '<',
    // expanded details
    expandedCenters: '<'
  }
});

