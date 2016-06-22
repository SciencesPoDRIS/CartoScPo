'use strict';

/* 
 * Bilateral view controller : api call and data manipulation to serve three 
 * visualisations (dualtimeline, brushing & comparison timeline). ******
 */

angular.module('bib.controller.home', [])
  .controller('home', [ "$scope", "$location", "utils", "fileService", 
  	"$http", "_", "leafletMarkerEvents", "leafletMapEvents", 
  	"$interpolate", "leafletData", "Lunr", "Elasticlunr", 
  	function ($scope, $location, utils, fileService, $http, _, 
  		leafletMarkerEvents, leafletMapEvents, $interpolate, 
  		leafletData, Lunr, Elasticlunr) {

	var url  = '../data/data.json';

	fileService
		.getFile(url)
		.then(function (result) {

			console.log("result", result);

	        var allMarkers = {};
	        $scope.centersSearch = []

			// calculate class for legend circle
			// var permanents = [];
			//  _.forEach(result, function (p) {
			// 	// console.log("p", p);
			// 	if (p.personnel)
			// 		permanents.push(Number(p.personnel['Personnels permanents']));
			// })

			function createMarkers(v) {
				
				if (v && v.administration) {
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
							else if (v.personnel['Personnels permanents'] > 20 
								&& v.personnel['Personnels permanents'] <= 40)
							 	iconSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.2;
							else if (v.personnel['Personnels permanents'] > 40 
								&& v.personnel['Personnels permanents'] <= 80)
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

							console.log("allMarkers create", allMarkers);
						})
					}	
				}	
			}
			
			// create all markers from result
			_.forIn(result, function (v, k) {
         
				$scope.centersSearch.push(v);
				
				createMarkers(v);
			})

			// create list for first renderer
			$scope.allCenters = [];
			var immutableAllCenters = [];
			_.forIn(result, function(v, k) {
				if (v.administration)
					$scope.allCenters.push(v);
					immutableAllCenters.push({center: v});
			})

			// create list of all words
			var allWords = [];
			_.forIn(result, function(tab, center) {
				_.forIn(tab, function(contentTab, tabName){
					_.forIn(contentTab, function(content, prop){
						
						var arrayContent = '';
						if (Array.isArray(content)) {
							//console.log("content 1", content)
							_.forEach(content, function (d) {
								arrayContent = d + ' ';
							})
							arrayContent = arrayContent.split(' ');
							allWords = allWords.concat(arrayContent);
						}
						if (!Array.isArray(content) 
							&& prop !== 'adressesGeo' 
							&& prop !== 'theme' 
							&& prop !== 'id' 
							&& prop !== 'Téléphone' 
							&& prop !== 'Géolocalisation(s)'
							&& prop !== 'CNRS (Oui/Non)'
							&& prop !== 'Code Unité'
							&& prop !== 'Courriel Direction'
							&& prop !== 'MENESR (Oui/Non)'
							&& prop !== 'Site Web'
							&& prop !== 'Commentaires'
							&& prop !== 'Courriel de l\'Ecole doctorale'
							&& prop !== 'Nombre de doctorants'
							&& prop !== 'Nombre de doctorants en science politique'
							&& prop !== 'Nombre de thèses soutenues en 2015'
							&& prop !== 'Effectif total'
							&& prop !== 'Lien vers la page "personnel" sur le site Web du centre'
							&& prop !== 'Personnels non permanents'
							&& prop !== '') {
							//console.log("content", content);
							content = content.replace(/.,:;'`/g , ' ');
							content = content.split(' ');
							allWords = allWords.concat(content);
							
						}
					})
				})
			})

			allWords = _.uniq(allWords);
			allWords = allWords.filter(function (d) {
				return d.length > 2;
			})
			
			$scope.allWords = allWords;
			
			// create a custom fulltextsearch to render json path of finding
			// create an index as big object with all words as keys which have the path as value
			// ex : Paris : id_administration_ville
			// put json copy in lowercase & input too

			// onglet - id - 
			var allProps = [];
			_.forIn(result, function(tab, center) {
				_.forIn(tab, function(contentTab, tabName){
					_.forIn(contentTab, function(content, prop){
						var id = center + '_' + tabName + '_' + prop;
						if (prop !== 'adressesGeo' && prop !== 'theme' && prop !== 'id')
							allProps.push({content: content, id: id });
					})
				})
			})

			var index = Elasticlunr(function () {
				this.addField('content');
			});

			_.forEach(allProps, function(d) {
				index.addDoc(d);
			})

			if (!$scope.filterSearch) {
				console.log("$scope.filterSearch", $scope.filterSearch);
				$scope.allCenters = immutableAllCenters;
			}

			//create allcenters on search pattern

			// sort list by input search
			$scope.showNameChanged = function () {
				console.log("$scope.filterSearch", $scope.filterSearch);
				if (!$scope.filterSearch) {
					console.log("$scope.filterSearch", $scope.filterSearch);
					$scope.allCenters = immutableAllCenters;
				}
				else {
					var searchResult = index.search($scope.filterSearch),
						resultWithPath = [],
						updateMarkers = [];

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
					})

					resultWithPath = _.groupBy(resultWithPath, 'id');
					var resultWithPathBis = []
					_.forIn(resultWithPath, function(v, k) {

						resultWithPathBis.push({center: result[k], search: v})
					})

					$scope.allCenters = resultWithPathBis;

					console.log("allMarkers", allMarkers);
					var listCentersFiltered = {};
					_.forEach(updateMarkers, function(d) {
						listCentersFiltered[d] = result[d];
					})
					console.log("listCentersFiltered 2", listCentersFiltered);

					allMarkers = {};
					_.forIn(listCentersFiltered, function(v, k) {
						console.log("v, k", v, k);
						createMarkers(v);
					})
					updateMapFromList();
				}
			}
			// Active tabs
			$scope.displayCenter = function(key, item) {
				$scope.centerActive = true;
				if (item.administration['Code Unité']) {

					$scope.administration = item.administration;
					$scope.personnel = item.personnel;
					$scope.ecole = item.ecole;
					$scope.recherche = item.recherche;
					$scope.axes = item.recherche['Axes de recherche'];
					$scope.contrats = item.recherche['Contrats de recherche'];
					$scope.section = item.recherche['Sections CNRS'];
					$scope.seminaires = item.recherche['Séminaires de recherche'];

					// create marker with center selected
					var markerChoosen = {};
					item.administration.adressesGeo.forEach(function (d) {
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
			                  enable: ['click', 'mouseover', 'mouseout'],
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
					$scope.nextCenter = {center: $scope.allCenters[key + 1], key: key + 1};
				}

			}

			//desactive tabs
			function updateMapFromList() {
				console.log("map update", allMarkers);
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
				if (key !== 0) {
					$scope.precedentCenter = $scope.allCenters[key - 1];
				}
				if (key < $scope.allCenters.length) {
					$scope.nextCenter = $scope.allCenters[key + 1];
				}
			}

			$scope.goNextCenter = function(center, key) {
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
		    		if (event.name === "leafletDirectiveMap.zoomstart" 
		    			|| event.name === "leafletDirectiveMap.move") {
						var centersInMap = [];

			        	leafletData.getMap().then(function(map) {

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
							})

							// create list of centers
							// make a service for this function
							$scope.allCenters = [];
							centersInMap.forEach(function (d) {
								if (result[d]) {
									$scope.allCenters.push({center: result[d]});
								}
							})
							console.log("$scope.allCenters", $scope.allCenters);
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