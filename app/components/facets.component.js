'use strict';

angular.module('bib.components').component('facets', {
  templateUrl: 'views/facets.html',
  bindings: {
    facets: '<',
    onToggleItem: '&'
  }
});
