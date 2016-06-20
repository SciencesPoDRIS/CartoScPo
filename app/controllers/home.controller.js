'use strict';

/* 
 * Bilateral view controller : api call and data manipulation to serve three 
 * visualisations (dualtimeline, brushing & comparison timeline). ******
 */

angular.module('bib.controller.home', [])
  .controller('home', [ "$scope", "$location", "utils", "fileService", "$http", "_", "leafletMarkerEvents", "leafletMapEvents", "$interpolate", "leafletData", function ($scope, $location, utils, fileService, $http, _, leafletMarkerEvents, leafletMapEvents, $interpolate, leafletData) {

	var url  = '../data/data.json';

	fileService
		.getFile(url)
		.then(function (result) {

	        var allMarkers = {};
	        $scope.centersSearch = []

			// calculate class for legend circle
			// var permanents = [];
			//  _.forEach(result, function (p) {
			// 	// console.log("p", p);
			// 	if (p.personnel)
			// 		permanents.push(Number(p.personnel['Personnels permanents']));
			// })
			
			// create all markers from result
			_.forIn(result, function (v, k) {

				$scope.centersSearch.push(v);
	
				if (v.administration) {
					if (v.administration.adressesGeo) {
						v.administration.adressesGeo.forEach(function (a, i) {
							
							if (v.administration['Sigle ou acronyme'].indexOf('-') > -1) {
								//need regex
								v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace('-', '_');
								v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace('-', '_');
							}

							// adjust icon size with 4 differents class (0-20, 20-40, 40-80, +80)
							var iconSize;
							if (v.personnel['Personnels permanents'] <= 20)
							 	iconSize = Math.sqrt(v.personnel['Personnels permanents']);
							else if (v.personnel['Personnels permanents'] > 20 && v.personnel['Personnels permanents'] <= 40)
							 	iconSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.2;
							else if (v.personnel['Personnels permanents'] > 40 && v.personnel['Personnels permanents'] <= 80)
							 	iconSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.6;
							else (v.personnel['Personnels permanents'] > 80)
							 	iconSize = Math.sqrt(v.personnel['Personnels permanents']) * 2;

							// two icons type : principal & secondaire
							var local_icons = { 
								principal: {
						            type: 'div',
						            iconSize: [iconSize, iconSize],
						            html: '<div></div>',
						            className: 'principal',
						            popupAnchor:  [0, -10]
						        },
						        secondaire: {
						            type: 'div',
						            iconSize: [iconSize, iconSize],
						            html: '<div></div>',
						            className: 'secondaire',
						            popupAnchor:  [-10, -10]
						        }
							}
							
							// create all markers
							allMarkers[v.administration['id']] = {
								lat: a.lat,
				                lng: a.lon,
				                message: v.administration['Intitulé'],
				                icon: i === 0 ? local_icons.principal : local_icons.secondaire,
				                focus: false
							}

						})
					}	
				}	
			})

			//create list for first renderer
			$scope.allCenters = [];
			_.forIn(result, function(v, k) {
				
				if (v.administration)
					$scope.allCenters.push(v.administration);
			})

			// Active tabs
			$scope.displayCenter = function(key, item) {
				$scope.centerActive = true;
				if (item['Code Unité']) {
					console.log("item", item);
					//console.log("result.item['id'].administration", result[item['id']].administration)
					$scope.administration = result[item['id']].administration;

					$scope.personnel = result[item['id']].personnel;
					//console.log("personnel", $scope.personnel);

					$scope.ecole = result[item['id']].ecole;
					//console.log("ecoles", $scope.ecole);

					$scope.recherche = result[item['id']].recherche;
					//console.log("recherche", $scope.recherche);

					$scope.axes = result[item['id']].recherche['Axes de recherche'];
					$scope.contrats = result[item['id']].recherche['Contrats de recherche'];
					$scope.seminaires = result[item['id']].recherche['Séminaires de recherche'];

					// create marker with center selected
					var markerChoosen = {};
					item.adressesGeo.forEach(function (d) {
						markerChoosen[item['id']] = {
							lat: d.lat,
			                lng: d.lon,
			                message: item['Intitulé'],
			                icon:  {
							            type: 'div',
							            iconSize: [10, 10],
							            html: '<div></div>',
							            className: 'principal',
							            popupAnchor:  [0, -10]
							        },
			                focus: false
						}
					})

					// update map with the marker of center selected
					angular.extend($scope, {
						center: {
			                lat: item.adressesGeo[0].lat,
			                lng: item.adressesGeo[0].lon,
			                zoom: 18
				        },	
			            markers: markerChoosen,
			            position: {
			                lat: 51,
			                lng: 0
			            },
			            events: { // or just {} //all events
			                markers:{
			                  enable: [ 'click', 'mouseover', 'mouseout' ],
			                  logic: 'broadcast'
			                }
			            }
					});	
				}

				// updated navigation'centers buttons
				// pass allCenters and key to button
				if (key !== 0) {
					$scope.precedentCenter = {center: $scope.allCenters[key - 1], key: key - 1};
				}
				if (key < $scope.allCenters.length) {
					$scope.nextCenter = {center: $scope.allCenters[key + 1], key: key + 1};;
				}

			}

			//desactive tabs
			$scope.centerDesactivate = function() {
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

			// display content of tabs
			$('#myTabs a').click(function (e) {
			  e.preventDefault()
			  $(this).tab('show')
			})

			// Center navigation with buttons
			$scope.goPrecedentCenter = function(center, key) {
				console.log("center", center)
				if (key !== 0) {
					$scope.precedentCenter = $scope.allCenters[key - 1];
				}
				if (key < $scope.allCenters.length) {
					$scope.nextCenter = $scope.allCenters[key + 1];
				}
			}

			$scope.goNextCenter = function(center, key) {
				console.log("center next", center)
				if (key !== 0) {
					$scope.precedentCenter = $scope.allCenters[key - 1];
				}
				if (key < $scope.allCenters.length) {
					$scope.nextCenter = $scope.allCenters[key + 1];
				}
			}

			// refresh list from zoom
			var mapEvents = leafletMapEvents.getAvailableMapEvents();
		    for (var k in mapEvents) {
		        var eventName = 'leafletDirectiveMap.' + mapEvents[k];
		        $scope.$on(eventName, function(event, args){
		    		if (event.name === "leafletDirectiveMap.zoomstart" || event.name === "leafletDirectiveMap.move") {
						var centersInMap = [];

			        	leafletData.getMap().then(function(map) {

			        		// get coordinate of map
							var mapNorthEastLat = map.getBounds()._northEast.lat,
								mapNorthEastLng = map.getBounds()._northEast.lng,
								mapSouthWestLat = map.getBounds()._southWest.lat,
								mapSouthWestLng = map.getBounds()._southWest.lng;

							//check if centers are between lat & lng of map
							_.forIn(allMarkers, function (v, k) {
								if (v.lat <= mapNorthEastLat && mapSouthWestLat <= v.lat && mapSouthWestLng <= v.lng &&  v.lng <= mapNorthEastLng ) {
									centersInMap.push(k)
								}
							})

							//create list of centers
							$scope.allCenters = [];
							centersInMap.forEach(function (d) {
								if (result[d]) {
									$scope.allCenters.push(result[d].administration);
								}
							})
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
		    })



		// Add custom legend
		leafletData.getMap().then(function(map) {

			var MyControl = L.Control.extend({
			    options: {
			        position: 'bottomleft'
			    },

			    onAdd: function (map) {
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
		})

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
	        $scope.$on(eventName, function(event, args){

	            $scope.eventDetected = event.name;

	            if ($scope.eventDetected === "leafletDirectiveMarker.click") {	            	
	            	$scope.centerActive = true;
	            	args.leafletEvent.target.openPopup()
	            }
	            
	            if ($scope.eventDetected === "leafletDirectiveMarker.mouseout") {
	            	args.leafletEvent.target.closePopup()

	            }
	        });
	    }
    }
]);