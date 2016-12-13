/* globals Papa */
'use strict';

angular.module('bib.controllers')
.controller('ToolCtrl', function($timeout, $routeParams, leafletData,
      mapService, centerService, facetService, autocompleteService, searchService) {

  // this collection is refreshed on search
  this.centers = [];

  // tabs

  this.currentTab = 'list';

  this.displayListTab = function () {
    this.currentTab = 'list';
  };

  this.displayTable = function () {
    this.currentTab = 'table';
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
    return searchService.getCenters(query).then(function (centers) {
      var facetedCenters = facetService.getCenters(centers);
      this.centers = facetedCenters;
      this.facets = facetService.getAll(facetedCenters);
      // map
      this.markers = mapService.createMarkers(facetedCenters);
      // grid
      this.gridOptions.data = centerService.gridify(facetedCenters);
    }.bind(this));
  };

  this.toggleFacetItem = function (event) {
    facetService.toggleItem(event.facet, event.item);
    this.triggerSearch(this.searchQuery);
  };

  this.resetSearch = function () {
    this.searchQuery = '';
    facetService.reset();
    this.triggerSearch();
  };

  // grid

  this.gridOptions = {
    enableFiltering: true,
    onRegisterApi: function(gridApi) {
      this.gridApi = gridApi;
    }.bind(this),
    columnDefs: [
    { field: 'Intitulé', enableFiltering: true },
    { field: 'Ville', enableFiltering: true },
    { field: 'Code Unité', enableFiltering: true }
    ]
  };

  this.exportGrid = function() {
    var selected = this.gridApi.grid.renderContainers.body.visibleRowCache.map(function(d) {
      delete d.entity['$$hashKey'];
      delete d.entity['addressesGeo'];
      delete d.entity['Commentaires'];
      delete d.entity['Logo'];
      return d.entity;
    });

    var csv = Papa.unparse(selected);
    var blob = new Blob([csv], { type: 'attachment/csv;charset=utf-8' });

    var a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('href', URL.createObjectURL(blob));
    a.setAttribute('download', 'data' + '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // init

  // centers with the details expanded
  this.expandedCenters = [];

  this.triggerSearch().then(function () {
    // jQuery + setTimeout === 'mega ouuhh'
    $timeout(function () {
      $('#center-list').scrollTo($('#center-' + $routeParams.centerId));
      this.expandedCenters.push($routeParams.centerId);
    }.bind(this), 2000);
  }.bind(this));

  // https://github.com/tombatossals/angular-leaflet-directive/issues/49
  this.refreshMap = function () {
    leafletData.getMap().then(function(map) {
      // shameless timeout of the death
      $timeout(function () {
        map.invalidateSize();
      }, 100);
    });
  };
});
