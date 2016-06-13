'use strict';

/* 
 * Bilateral view controller : api call and data manipulation to serve three 
 * visualisations (dualtimeline, brushing & comparison timeline). ******
 */

angular.module('bib.controller.home', [])
  .controller('home', [ "$scope", "$location", "utils", "fileService", "$http", "_", "leafletMarkerEvents", "$interpolate", function ($scope, $location, utils, fileService, $http, _, leafletMarkerEvents,  $interpolate) {

	var url  = '../data/data.json';

	fileService
		.getFile(url)
		.then(function (result) {

			console.log("result", result);
	        var markers = {};

			_.forIn(result, function (v, k) {
					
				// console.log("v", v);
				if (v.administration) {
					if (v.administration.adressesGeo) {
						v.administration.adressesGeo.forEach(function (a, i) {
							
							if (v.administration['Sigle ou acronyme'].indexOf('-') > -1) {
								//need regex
								v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace('-', '_');
								v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace('-', '_');
							}
							var local_icons = { 
								principal: {
						            type: 'div',
						            iconSize: [10, 10],
						            html: '<div></div>',
						            className: 'principal',
						            popupAnchor:  [0, -10]
						        },
						        secondaire: {
						            type: 'div',
						            iconSize: [10, 10],
						            html: '<div></div>',
						            className: 'secondaire',
						            popupAnchor:  [-10, -10]
						        }
							}
							
							markers[v.administration['Sigle ou acronyme']] = {

								lat: a.lat,
				                lng: a.lon,
				                message: v.administration['Intitulé'],
				                icon: i === 0 ? local_icons.principal : local_icons.secondaire,
				                focus: true

							}

						})
					}	
				}
			})

			angular.extend($scope, {
	            markers: markers,
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

			$scope.allCenters = [];
			_.forIn(result, function(v, k) {
				$scope.allCenters.push(v.administration);
			})

			$scope.displayCenter = function(item) {
				$scope.centerActive = true;
				if (item['Code Unité']) {
					console.log("item", item['id']);
					console.log("result.item['id'].administration", result[item['id']].administration)
					$scope.administration = result[item['id']].administration;
					$scope.personnel = result[item['id']].personnel;
					$scope.ecoles = result[item['id']].ecole;
					$scope.recherche = result[item['id']].recherche;
				}
			}

			$scope.centerDesactivate = function() {
				$scope.centerActive = false;
			}

			$('#myTabs a').click(function (e) {
			  e.preventDefault()
			  $(this).tab('show')
			})
		})

	angular.extend($scope, {
		    center: {
	                lat: 46.22545288226939,
	                lng: 3.3618164062499996,
	                zoom: 2
	        },
	        legend: {
                    position: 'bottomleft',
                    colors: [ 'red', 'blue' ],
                    labels: [ 'Adresse principale', 'Adresse secondaire' ]
            }
	    })

	$scope.events = {
	        markers: {
	            enable: leafletMarkerEvents.getAvailableEvents(),
	        }
	    };

	    $scope.eventDetected = "No events yet...";
	    var markerEvents = leafletMarkerEvents.getAvailableEvents();
	    console.log("markerEvents", markerEvents);
	    for (var k in markerEvents){
	        var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
	        $scope.$on(eventName, function(event, args){

	            $scope.eventDetected = event.name;
	            console.log("$scope.eventDetected", $scope.eventDetected);

	            if ($scope.eventDetected === "leafletDirectiveMarker.click") {

	            	console.log("click -------")
	            	$scope.centerActive = true;
	            }
	            if ($scope.eventDetected === "leafletDirectiveMarker.mouseover") {
	            	console.log("mouseover -------")
	            	console.log("args", args);
	            	args.leafletEvent.target.openPopup()
	            }
	            if ($scope.eventDetected === "leafletDirectiveMarker.mouseout") {
	            	console.log("mouseout -------")
	            	args.leafletEvent.target.closePopup()
	            	// args.leafletEvent.target.offset()
	            	// args.leafletEvent.originalEvent.offsetX = 0;
	            	// args.leafletEvent.originalEvent.offsetY = 0;

	            }
	        });
	    }

    }
]);