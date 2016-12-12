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

      // reset selection in list
      $scope.idSelectedCenter = null;

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

        updateMapFromList();
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
        var updateMarkers = [];

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
            updateMarkers.push(searchPath[0]);
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
          if (v)
            $scope.keyInList[v.search[0].id] = k;
        });

        // recreate list ?
        var listCentersFiltered = {};
        _.forEach(updateMarkers, function(d) {
          listCentersFiltered[d] = $scope.result.allCenters[d];
        });

        // recreate allMarkers, maybe filtered ?
        $scope.allMarkers = mapService.createMarkers(listCentersFiltered);

        updateMapFromList();
      }
    };

    // update map from list
    function updateMapFromList() {
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
          zoom: 6
        },
        events: { // or just {} //all events
          markers: {
            enable: ['click', 'mouseover', 'mouseout'],
            logic: 'broadcast'
          }
        }
      });
    }

    function displayCenterByDefault(key, item, keyCenter) {
      $scope.centerSelected = item;

      // display details center & tooltip on map
      mapService.displayCenterSelected(item, key, keyCenter, $scope);

      // updated navigation'centers buttons
      $('#myTab li').removeClass('active');
      $('.collapse .tab-pane').removeClass('active');
      $('.collapse .description').addClass('active');
    }

    // Select first center by default
    displayCenterByDefault(0, $scope.allCenters[0], 0);

    // active tabs
    $scope.displayCenter = function(key, item, keyCenter) {
      $scope.centerSelected = item;

      // display details center & tooltip on map
      mapService.displayCenterSelected(item, key, keyCenter, $scope);
    };

    // desactive tabs
    $scope.centerDesactivate = function() {
      $scope.idSelectedCenter = null;
      updateMapFromList();
    };

    // display a specific tab
    $scope.openSpecificTab = function(item, keyCenter) {
      var center = { center: $scope.result.allCenters[item.id] };

      // display center details
      mapService.displayCenterSelected(center, null, keyCenter, $scope);

      var tab = item.tab === 'description administrative' ? 'description' : item.tab;

      // active good tab
      $('#myTab li').removeClass('active');
      $('.collapse .tab-pane').removeClass('active');
      $('.collapse .' + tab).addClass('active');
    };

    // refresh list from zoom
    var mapEvents = leafletMapEvents.getAvailableMapEvents();
    for (var k in mapEvents) {
      var eventName = 'leafletDirectiveMap.' + mapEvents[k];
      $scope.$on(eventName, function(event) {
        if ($scope.currentTab !== 'map') return;
        if (event.name === 'leafletDirectiveMap.zoomstart' || event.name === 'leafletDirectiveMap.move') {
          var centersInMap = [];

          // get lat & lng of map
          leafletData.getMap().then(function(map) {

            // desactivate center selected
            $scope.idSelectedCenter = null;

            // close popup
            leafletData.getMap().then(function(map) {
              map.closePopup();
            });

            // get coordinate of map -> make function then a service
            var mapNorthEastLat = map.getBounds()._northEast.lat;
            var mapNorthEastLng = map.getBounds()._northEast.lng;
            var mapSouthWestLat = map.getBounds()._southWest.lat;
            var mapSouthWestLng = map.getBounds()._southWest.lng;

            // check if centers are between lat & lng of map
            _.forIn($scope.allMarkers, function(v, k) {
              if (v.lat <= mapNorthEastLat && mapSouthWestLat <= v.lat && mapSouthWestLng <= v.lng && v.lng <= mapNorthEastLng) {
                centersInMap.push(k);
              }
            });

            // display number of marker/address on map
            $scope.centersInMap = centersInMap.length;

            function inMap(address) {
              return (address.lat <= mapNorthEastLat && mapSouthWestLat <= address.lat && mapSouthWestLng <= address.lon && address.lon <= mapNorthEastLng);
            }

            // create list of centers if no search
            if (!$scope.filtersOn) {
              $scope.allCenters = [];
              centersInMap.forEach(function(d) {
                d = d.split('_');

                var idCenter = d[0];
                if ($scope.result.allCenters[idCenter]) {
                  // check if address in map
                  _.map($scope.result.allCenters[idCenter].administration.addressesGeo, function(d) {
                    d.active = inMap(d);
                  });

                  $scope.allCenters.push({ center: $scope.result.allCenters[idCenter] });
                }
              });
              // set list og centers
              $scope.allCenters = _.uniqBy($scope.allCenters, 'center');
            } else { // list of centers with search result
              // convert array to obj with center key
              var allCentersObj = {};

              // get id of centers in current list
              _.forEach($scope.allCenters, function(v) {
                if (v) {
                  var id = v.center.administration.id.trim().replace(/ /g, '');
                  allCentersObj[id] = v;
                }
              });

              // get all id of center in map
              var allCenterIdSearch = [];
              centersInMap.forEach(function(d) {
                var idCenter = d.split('_')[0];
                allCenterIdSearch.push(idCenter);
              });

              // set on list of address to keep only centers
              allCenterIdSearch = _.uniq(allCenterIdSearch);

              // select only center in map and display in list
              $scope.allCenters = [];
              _.forEach(allCenterIdSearch, function(d) {
                // filter only address on the map
                $scope.allCenters.push(allCentersObj[d]);
              });
            }

            // create keyInList
            $scope.keyInList = {};
            _.forEach($scope.allCenters, function(v, k) {
              if (v) {
                var id = v.center.administration.id.trim().replace(/ /g, '');
                $scope.keyInList[id] = k;
              }
            });
          });
        }
      });
    }

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
