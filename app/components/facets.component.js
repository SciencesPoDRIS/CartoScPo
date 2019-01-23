'use strict';

angular.module('bib.components').component('facets', {
  templateUrl: 'views/facets.html',
  controller: function(facetService) {
    this.$onInit = function() {
      facetService.updateLocation();
    };
  },
  bindings: {
    facets: '<',
    onToggleItem: '&'
  }
});
