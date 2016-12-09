'use strict';

angular.module('bib.controllers')
.controller('FacetsCtrl', function(facetService) {
  facetService.get().then(function (facets) {
    this.facets = facets;
  }.bind(this));
});
