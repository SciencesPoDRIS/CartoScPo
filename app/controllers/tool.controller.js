/* globals Papa */
'use strict';

angular
  .module('bib.controllers')
  .controller('ToolCtrl', function(
    $q,
    $timeout,
    $routeParams,
    leafletData,
    mapService,
    centerService,
    facetService,
    autocompleteService,
    searchService
  ) {
    // this collection is refreshed on search
    this.centers = [];

    // tabs

    this.currentTab = 'list';

    this.displayTab = function(tab) {
      this.currentTab = tab;
      if (tab === 'map') this.refreshMap();
    };

    // search & facets

    // ng-model
    this.searchQuery = '';

    autocompleteService.getWords().then(
      function(words) {
        this.words = words;
      }.bind(this)
    );

    // all Words in typeahead search in lowercase
    this.startsWith = function(state, viewValue) {
      return (
        state.substr(0, viewValue.length).toLowerCase() ===
        viewValue.toLowerCase()
      );
    };

    this.triggerSearch = function(query) {
      var centersP = searchService.getCenters(query);
      var facetedCentersP = centersP.then(function(centers) {
        return facetService.getCenters(centers);
      });
      var facetsP = facetedCentersP.then(function(facetedCenters) {
        return facetService.getAll(facetedCenters);
      });
      return $q.all([facetedCentersP, facetsP]).then(
        _.spread(
          function(facetedCenters, facets) {
            this.centers = facetedCenters;
            this.facets = facets;
            // map
            this.markers = mapService.createMarkers(facetedCenters);
            // grid
            this.gridOptions.data = facetedCenters;
          }.bind(this)
        )
      );
    };

    this.toggleFacetItem = function(event) {
      facetService.toggleItem(event.facet, event.item);
      this.triggerSearch(this.searchQuery);
    };

    this.resetSearch = function() {
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
        { field: 'name', enableFiltering: true, width: 400 },
        { field: 'code', enableFiltering: true, width: 100 }
      ]
    };

    this.exportGrid = function() {
      var selected = this.gridApi.grid.renderContainers.body.visibleRowCache.map(
        function(d) {
          const cleaned = {};
          Object.keys(d.entity).forEach(function(key) {
            // arrays don't play well with csv cells
            if (
              Array.isArray(d.entity[key]) ||
              typeof d.entity[key] === 'object' ||
              key == '$$hashKey'
            )
              return;
            cleaned[key] = d.entity[key];
          });
          return cleaned;
        }
      );

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

    this.triggerSearch().then(
      function() {
        // jQuery + setTimeout === 'mega ouuhh'
        $timeout(
          function() {
            if ($routeParams.centerId && $routeParams.centerId != '') {
              $('#center-list').scrollTo($('#center-' + $routeParams.centerId));
              this.expandedCenters = [$routeParams.centerId];
            }
          }.bind(this),
          2000
        );
      }.bind(this)
    );

    // https://github.com/tombatossals/angular-leaflet-directive/issues/49
    this.refreshMap = function() {
      leafletData.getMap().then(function(map) {
        // shameless timeout of the death
        $timeout(function() {
          map.invalidateSize();
        }, 100);
      });
    };
  });
