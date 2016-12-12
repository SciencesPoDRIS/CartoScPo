'use strict';

angular.module('bib.controllers')
.controller('ToolCtrl', function(leafletMapEvents, leafletData,
  mapService, centerService, facetService, autocompleteService, searchService) {

  // this collection is refreshed on search
  this.centers = [];

  // tabs

  this.currentTab = 'list';

  this.displayListTab = function () {
    this.currentTab = 'list';
  };

  this.displayMapTab = function () {
    this.currentTab = 'map';
    this.refreshMap();
  };

  // search & facets

  // ng-model
  this.searchQuery = '';

  autocompleteService.getWords().then(function (words) {
    this.words = words;
  }.bind(this));

  // all Words in typeahead search in lowercase
  this.startsWith = function(state, viewValue) {
    return state.substr(0, viewValue.length).toLowerCase() === viewValue.toLowerCase();
  };

  this.triggerSearch = function (query) {
    searchService.getCenters(query).then(function (centers) {
      var facetedCenters = facetService.getCenters(centers);
      this.centers = facetedCenters;
      this.facets = facetService.getAll(facetedCenters);
    }.bind(this));
  };

  this.toggleFacetItem = function (facet, item) {
    facetService.toggleFacetItem(facet, item);
    this.triggerSearch(this.searchQuery);
  };

  this.resetSearch = function () {
    this.searchQuery = '';
    facetService.reset();
    this.triggerSearch();
  };

  // init
  this.triggerSearch();

  // https://github.com/tombatossals/angular-leaflet-directive/issues/49
  this.refreshMap = function () {
    leafletData.getMap().then(function(map) {
      // shameless timeout of the death
      setTimeout(function () {
        map.invalidateSize();
      }, 100);
    });
  };
});
