'use strict';

/* 
 * Bilateral view controller : api call and data manipulation to serve three 
 * visualisations (dualtimeline, brushing & comparison timeline). ******
 */

angular.module('bib.controller.home', [])
  .controller('home', [ "$scope", "$location", "$anchorScroll", "utils", "fileService", 
  	"$http", "_", "leafletMarkerEvents", "leafletMapEvents", 
  	"$interpolate", "leafletData", "Elasticlunr", '$sce', 'mapService',
  	function ($scope, $location, $anchorScroll, utils, fileService, $http, _, 
  		leafletMarkerEvents, leafletMapEvents, $interpolate, 
  		leafletData, Elasticlunr, $sce, mapService) {

	var url  = '../data/data.json';

	// navigation
	function navigation(key) {
		console.log("key", key);
		if (key === 0) {
			$scope.precedentCenter = null;
		}
		if (key > 0) {
			$scope.precedentCenter = {center: $scope.allCenters[key - 1].center, key: key - 1};
		}
		if (key < $scope.allCenters.length - 1) {
			$scope.nextCenter = {center: $scope.allCenters[key + 1].center, key: key + 1};
		}
		if (key === $scope.allCenters.length - 1) {
			$scope.nextCenter = null;
		}

		$scope.currentCenter = $scope.allCenters[key].center.administration['Intitulé'];
		$("#listCenters").scrollTo($('#' + key));
	}


	fileService
		.getFile(url)
		.then(function (result) {

			// calculate class for legend circle
			// var permanents = [];
			//  _.forEach(result, function (p) {
			// 	// console.log("p", p);
			// 	if (p.personnel)
			// 		permanents.push(Number(p.personnel['Personnels permanents']));
			// })

			// see rootScope to passe scope to service

			// see controller of directive to send business logical to service or to directive controller 

			// create all markers from result
			$scope.centersSearch = []
			var allMarkers = {};
			_.forIn(result.allCenters, function(v, k) {
				$scope.centersSearch.push(v);
				mapService.createMarkers(v, allMarkers);
			});

			// create list for first renderer
			$scope.allCenters = [];

			// create immutable list as reference data
			var immutableAllCenters = [];
			_.forIn(result.allCenters, function(v, k) {
				if (v.administration) {
					//console.log("v", v);
					$scope.allCenters.push(v);
					immutableAllCenters.push({center: v});
				}
			});

			console.log("immutableAllCenters 1", immutableAllCenters);

			// keep the place of center in list
			$scope.keyInList =  {};
			 _.forEach($scope.allCenters, function (v, k) {
			 	var id = v.administration['id'].trim();
					id = id.replace(/ /g, '');
			 	$scope.keyInList[id] = k;
			})
		
			// create scope with all words from data
			$scope.allWords = result.allWords;
			
			// create index for fulltext search
			var index = Elasticlunr(function() {
				this.addField('content');
			});

			// populate index with props
			_.forEach(result.allProps, function(d) {
				index.addDoc(d);
			});

			// if no word in input display allcenters
			if (!$scope.filterSearch) {
				console.log("here 2")
				$scope.allCenters = immutableAllCenters;
			}

			$scope.startsWith = function(state, viewValue) {
              return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
            }

            // reset all filters : list, map, navigation, center displayed
            $scope.resetFilter = function() {
            	$scope.filterSearch = '';

            	$scope.allCenters = immutableAllCenters;

            	//get allCenters
				var listCentersFiltered = {};
				_.forIn(result.allCenters, function(v, k) {
					listCentersFiltered[k] = v;
				});

				// get all markers
				allMarkers = {};
				_.forIn(listCentersFiltered, function(v, k) {
					mapService.createMarkers(v, allMarkers);
				});
				updateMapFromList();

				// reset navigation
				$scope.precedentCenter = null;
				$scope.nextCenter = null;
				$scope.currentCenter = null;
            }

			// sort list by input search
			$scope.showNameChanged = function() {
				
				$scope.centerActive = true;
				if (!$scope.filterSearch) {
					$scope.allCenters = immutableAllCenters;
				}
				else {
					console.log("$scope.filterSearch", $scope.filterSearch);

					var searchResult = index.search($scope.filterSearch, {
						    fields: {
						        "content": {"boost": 2}
						    },
						    bool: "OR",
						    expand: true
						});

					var	resultWithPath = [],
						updateMarkers = [];

					console.log("searchResult", searchResult);

					_.forEach(searchResult, function(d) {
						if (d) {
							var searchPath = d.ref.split('_');
							resultWithPath.push({
								id: searchPath[0], 
								tab: searchPath[1], 
								prop: searchPath[2]
							});
							updateMarkers.push(searchPath[0]);
						}
					});

					resultWithPath = _.groupBy(resultWithPath, 'id');
					var resultWithPathBis = []
					_.forIn(resultWithPath, function(v, k) {
						resultWithPathBis.push({center: result.allCenters[k], search: v})
					});

					$scope.allCenters = resultWithPathBis;
					console.log("$scope.allCenters show", $scope.allCenters);


					//create index of center in list
					$scope.keyInList =  {};
					 _.forEach($scope.allCenters, function (v, k) {
					 	//console.log("v", v, k);
					 	if (v) {
					 		//console.log("v.search[0].id", v.search[0].id);
					 		$scope.keyInList[v.search[0].id] = k;
					 	}
					});

					console.log("$scope.keyInList", $scope.keyInList);

					var listCentersFiltered = {};
					_.forEach(updateMarkers, function(d) {
						listCentersFiltered[d] = result.allCenters[d];
					});

					allMarkers = {};
					_.forIn(listCentersFiltered, function(v, k) {
						mapService.createMarkers(v, allMarkers);
					});

					updateMapFromList();
					console.log("here");
				}
			}

			// desactive tabs
			function updateMapFromList() {
				console.log("allMarkers 2", allMarkers);
				$scope.centerActive = false;
				angular.extend($scope, {
					center: {
		                lat: 46.22545288226939,
		                lng: 3.3618164062499996,
		                zoom: 2
			        },	
		            markers: allMarkers,
		            position: {
		                lat: 51,
		                lng: 0,
		                zoom: 6
		            },
		            events: { // or just {} //all events
		                markers:{
		                  enable: [ 'click', 'mouseover', 'mouseout' ],
		                  logic: 'broadcast'
		                }
		            }
				});	
			}

			
			// Active tabs
			$scope.displayCenter = function(key, item) {

				// display tabs
				$scope.centerActive = true;

				// display details center & tooltip on map
				mapService.displayCenterSelected(item, key, $scope, leafletData, $sce);

				// updated navigation'centers buttons
				navigation(key);
			}

			//desactive tabs
			$scope.centerDesactivate = function() {
				$scope.idSelectedCenter = null;
				$scope.centerActive = false;
				
				angular.extend($scope, {
				center: {
	                lat: 46.22545288226939,
	                lng: 3.3618164062499996,
	                zoom: 2
		        },	
	            markers: allMarkers,
	            position: {
	                lat: 51,
	                lng: 0,
	                zoom: 6
	            },
	            events: { // or just {} //all events
	                markers:{
	                  enable: ['click', 'mouseover', 'mouseout'],
	                  logic: 'broadcast'
	                }
	            }
				});	
			}

			// display content of tabs
			// $('#myTabs a').click(function(e) {
			// 	console.log("e", e);
			//   e.preventDefault()
			//   $(this).tab('show')
			// });

			// jQuery('#myTab a:last').tab('show')

			//display a specific tab
			$scope.openSpecificTab = function(item) {
				console.log("item 3", item);
				$("#myTab li").removeClass("active");
				$('.tab-pane').removeClass("active");				
				$( "." + item.tab ).addClass( "active" );	
			}

			

			// Center navigation with buttons
			$scope.goPrecedentCenter = function(item) {
				console.log("item 1", item);
				if (item) {
					navigation(item.key);
					mapService.displayCenterSelected(item, item.key, $scope, leafletData, $sce);
				}
			};

			$scope.goNextCenter = function(item) {
				console.log("item 2", item);
				if (item) {
					navigation(item.key);
					mapService.displayCenterSelected(item, item.key, $scope, leafletData, $sce);
				}
			};

			// center map on France
			$scope.zoomFrance = function() {
				 // display map with markers choosen
				angular.extend($scope, {
					center: {
			                lat: 46.227638,
			                lng: 2.213749,
			                zoom: 6
			        },
		            markers: allMarkers,
		            position: {
		                lat: 51,
		                lng: 0,
		                zoom: 4
		            },
		            events: { // or just {} //all events
		                markers:{
		                  enable: [ 'click', 'mouseover', 'mouseout' ],
		                  logic: 'broadcast'
		                }
		            }
				});	
			}

			// refresh list from zoom
			var mapEvents = leafletMapEvents.getAvailableMapEvents();
		    for (var k in mapEvents) {
		        var eventName = 'leafletDirectiveMap.' + mapEvents[k];
		        $scope.$on(eventName, function(event, args) {
		    		if (event.name === "leafletDirectiveMap.zoomstart" 
		    			|| event.name === "leafletDirectiveMap.move") {
						var centersInMap = [];

			        	leafletData.getMap().then(function(map) {

			        		// desactivate center selected 
			        		$scope.nextCenter = null;
			        		$scope.precedentCenter = null;
			        		$scope.idSelectedCenter = null;

			        		// close popup
			        		leafletData.getMap().then(function(map) {
								map.closePopup();
							})

			        		// get coordinate of map
							var mapNorthEastLat = map.getBounds()._northEast.lat,
								mapNorthEastLng = map.getBounds()._northEast.lng,
								mapSouthWestLat = map.getBounds()._southWest.lat,
								mapSouthWestLng = map.getBounds()._southWest.lng;

							//check if centers are between lat & lng of map
							_.forIn(allMarkers, function (v, k) {
								if (v.lat <= mapNorthEastLat && mapSouthWestLat <= v.lat 
									&& mapSouthWestLng <= v.lng &&  v.lng <= mapNorthEastLng ) {
									centersInMap.push(k)
								}
							});
							//console.log("centersInMap", centersInMap);

							// create list of centers
							// make a service for this function
							$scope.allCenters = [];
							centersInMap.forEach(function (d) {
								if (result.allCenters[d]) {
									$scope.allCenters.push({center: result.allCenters[d]});
								}
							});

							// create keyInList
							//console.log("allCenters zoom", $scope.allCenters);
							$scope.keyInList =  {};
							 _.forEach($scope.allCenters, function (v, k) {
							 	//console.log("v", v);
							 	var id = v.center.administration['id'].trim();
									id = id.replace(/ /g, '');
							 	$scope.keyInList[id] = k;
							});
							//console.log("$scope.keyInList", $scope.keyInList);
						})
		    		}
		        });
		    }

		    // display map with markers choosen
			angular.extend($scope, {
				center: {
		                lat: 46.22545288226939,
		                lng: 3.3618164062499996,
		                zoom: 2
		        },
	            markers: allMarkers,
	            position: {
	                lat: 51,
	                lng: 0,
	                zoom: 4
	            },
	            events: { // or just {} //all events
	                markers:{
	                  enable: [ 'click', 'mouseover', 'mouseout' ],
	                  logic: 'broadcast'
	                }
	            }
			});	
		})

		// default map settings
		angular.extend($scope, {
			    center: {
		                lat: 46.22545288226939,
		                lng: 3.3618164062499996,
		                zoom: 2
		        },
		        layers: {
		        	baselayers: {
		                osm: {
		                    name: 'OpenStreetMap',
		                    url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
		                    type: 'xyz'
		                }
		            }
	            }
		});

		// Add custom legend
		leafletData.getMap().then(function(map) {

			var MyControl = L.Control.extend({
			    options: {
			        position: 'bottomleft'
			    },

			    onAdd: function(map) {
			        // create the control container with a particular class name
			        var container = L.DomUtil.create('div', 'my-custom-control');
			        container.innerHTML = '<svg width="250" height="150"> '
			        + '<rect width="20" height="20" x="15" y="25" fill="green" />'
			        + '<text x="50" y="40" fill="black">Adresse principale</text>'
			        + '<rect width="20" height="20" x="15" y="50" fill="green" fill-opacity="0.5"/>'
			        + '<text x="50" y="65" fill="black">Adresse secondaire</text>'
			        + '<text x="15" y="85" fill="black">Nombre de chercheurs permanents</text>'

			        + '<circle cx="25" cy="135" r="5" stroke="black" stroke-width="1" fill="rgba(0,0,0,0)" />'
			        + '<line x1="50" y1="130" x2="70" y2="130" style="stroke:rgb(0,0,0);stroke-width:1" />'
					+ '<text x="80" y="135" fill="black">20</text>'

			        + '<circle cx="25" cy="130" r="10" stroke="black" stroke-width="1" fill="rgba(0,0,0,0)" />'
			        + '<line x1="50" y1="120" x2="70" y2="120" style="stroke:rgb(0,0,0);stroke-width:1" />'
					+ '<text x="80" y="125" fill="black">40</text>'

			        + '<circle cx="25" cy="125" r="15" stroke="black" stroke-width="1" fill="rgba(0,0,0,0)" />'
			        + '<line x1="50" y1="110" x2="70" y2="110" style="stroke:rgb(0,0,0);stroke-width:1" />'
					+ '<text x="80" y="115" fill="black">80</text>'

			        + '<circle cx="25" cy="120" r="20" stroke="black" stroke-width="1" fill="rgba(0,0,0,0)" />'
			        + '<line x1="50" y1="100" x2="70" y2="100" style="stroke:rgb(0,0,0);stroke-width:1" />'
			        + '<text x="80" y="105" fill="black"> + 80</text>'

			        +  '</svg>';

			        return container;
			    }
			});
			map.addControl(new MyControl());
		});

		// catch map events
		$scope.events = {
	        markers: {
	            enable: leafletMarkerEvents.getAvailableEvents(),
	        }
	    };

	    var markerEvents = leafletMarkerEvents.getAvailableEvents();

	    // detect event on markers and display or close popup
	    for (var k in markerEvents) {
	        var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
	        $scope.$on(eventName, function(event, args) {

	            $scope.eventDetected = event.name;

	            if ($scope.eventDetected === "leafletDirectiveMarker.click") {
	            	console.log("args.leafletEvent.target", args.leafletEvent.target);
	            	// open popup
	            	args.leafletEvent.target.openPopup();

	            	// hightlight center in list
		       		var centerId = args.leafletEvent.target.options.id;

		       		console.log("keyInList", $scope.keyInList);
		       		$scope.idSelectedCenter = $scope.keyInList[centerId];

		       		var key = $scope.idSelectedCenter;
		       		$scope.key = key;
		       		console.log("key map", key);

		       		console.log("$scope.allCenters", $scope.allCenters);

					mapService.displayCenterSelected($scope.allCenters[key], key, $scope, leafletData, $sce);
					
					$("#listCenters").scrollTo($('#' + key));
				    // update navigation controls
					navigation(key);
				}

	            if ($scope.eventDetected === "leafletDirectiveMarker.mouseout") {
	            	args.leafletEvent.target.closePopup();
	            }
	        });
	    }
    }
]);