'use strict';

angular.module('bib.controllers')
.controller('ToolCtrl', function($scope, leafletMapEvents, leafletData,
  mapService, centerService, autocompleteService, searchService) {

  // tabs

  $scope.currentTab = 'list';

  $scope.displayListTab = function () {
    $scope.currentTab = 'list';
  };

  $scope.displayMapTab = function () {
    $scope.currentTab = 'map';
    $scope.refreshMap();
  };

  // search

  // ng-model
  $scope.filterSearch = '';

  autocompleteService.getWords().then(function (words) {
    $scope.allWords = words;
  });

  // all Words in typeahead search in lowercase
  $scope.startsWith = function(state, viewValue) {
    return state.substr(0, viewValue.length).toLowerCase() === viewValue.toLowerCase();
  };

  // Load Data & init business logic
  centerService.getAll().then(function(centers) {
    $scope.result = { allCenters: centers };
    $scope.centersSearch = [];
    _.forIn($scope.result.allCenters, function(v) {
      $scope.centersSearch.push(v);
    });

    $scope.allMarkers = mapService.createMarkers($scope.result.allCenters);

    // create list for first renderer
    $scope.allCenters = [];

    // use filter on allMarkers, don't mute allMarkers, allCenters
    // create immutable list as reference data
    var immutableAllCenters = [];
    _.forIn($scope.result.allCenters, function(v) {
      if (v.administration) {
        $scope.allCenters.push(v);
        immutableAllCenters.push({ center: v });
      }
    });

    // keep the place of center in list
    $scope.keyInList = {};
    _.forEach($scope.allCenters, function(v, k) {
      var id = v.administration['id'];
      $scope.keyInList[id] = k;
    });

    // if no word in input display allcenters
    if (!$scope.filterSearch) {
      $scope.allCenters = immutableAllCenters;
      $scope.filtersOn = false;
    }

    /*
     * All functions used in view
     */

    // reset all filters : list, map, navigation, center displayed
    $scope.resetFilter = function() {
      $scope.filterSearch = '';

      // close popup
      leafletData.getMap().then(function(map) {
        map.closePopup();
      });

      if ($scope.filtersOn) {
        $scope.allCenters = immutableAllCenters;
        $scope.filtersOn = false;

        // get allCenters
        var listCentersFiltered = {};
        _.forIn($scope.result.allCenters, function(v, k) {
          listCentersFiltered[k] = v;
        });

        $scope.allMarkers = mapService.createMarkers(listCentersFiltered);
      }
    };

    // sort list by input search
    $scope.showNameChanged = function(word) {
      if (!$scope.filterSearch) {
        $scope.allCenters = immutableAllCenters;
        $scope.filtersOn = false;
      }

      if ($scope.filterSearch || word) {
        if (word) $scope.filterSearch = word;
        $scope.filtersOn = true;

        var searchResult = searchService.search($scope.filterSearch);
        console.log('searchResult', searchResult);
        var resultWithPath = [];

        // split slug
        _.forEach(searchResult, function(d) {
          if (d) {
            var searchPath = d.ref.split('_');
            var tab = searchPath[1] === 'personnel' || searchPath[1] === 'administration'
              ? 'description administrative' : searchPath[1];

            resultWithPath.push({
              id: searchPath[0],
              tab: tab,
              prop: searchPath[2]
            });
          }
        });

        // manage multiple results for one center
        resultWithPath = _.groupBy(resultWithPath, 'id');

        // aggregate search result and center
        var resultWithPathBis = [];
        _.forIn(resultWithPath, function(v, k) {
          resultWithPathBis.push({ center: $scope.result.allCenters[k], search: v });
        });

        // bind center result to scope (list)
        $scope.allCenters = resultWithPathBis;

        // create index of center in list -> create a function -> service
        $scope.keyInList = {};
        _.forEach($scope.allCenters, function(v, k) {
          if (v) $scope.keyInList[v.search[0].id] = k;
        });

        // recreate list ?
        var listCentersFiltered = {};
        _.forEach(Object.keys(resultWithPath), function(d) {
          listCentersFiltered[d] = $scope.result.allCenters[d];
        });

        // recreate allMarkers, maybe filtered ?
        $scope.allMarkers = mapService.createMarkers(listCentersFiltered);
      }
    };

    // display map with markers choosen
    angular.extend($scope, {
      markers: $scope.allMarkers,
      leafletCenter: {
        lat: 46.22545288226939,
        lng: 3.3618164062499996,
        zoom: 2
      },
      position: {
        lat: 51,
        lng: 0,
        zoom: 4
      },
      events: { // or just {} //all events
        markers: {
          enable: ['click', 'mouseover', 'mouseout'],
          logic: 'broadcast'
        }
      }
    });
  });

  // https://github.com/tombatossals/angular-leaflet-directive/issues/49
  $scope.refreshMap = function () {
    leafletData.getMap().then(function(map) {
      // shameless timeout of the death
      setTimeout(function () {
        map.invalidateSize();
      }, 100);
    });
  };
});
