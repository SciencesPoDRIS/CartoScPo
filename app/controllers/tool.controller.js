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

  $scope.triggerSearch = function (query) {
    searchService.getCenters(query).then(function (centers) {
      $scope.centers = centers;
    });
  };

  $scope.triggerSearch();

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
