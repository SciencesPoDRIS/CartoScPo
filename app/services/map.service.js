angular.module('map.service', [])
  .factory('mapService', function() {

    return {
		createMarkers: function (v, allMarkers) {
			function fixIconSize(v) {
				console.log("v", v.personnel['Personnels permanents']);
				var personnelSize;

				if (v.personnel['Personnels permanents'] <= 20) {
				 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']);
				 	personnelSize = 'small';
				}
				else if (v.personnel['Personnels permanents'] > 20 
					&& v.personnel['Personnels permanents'] <= 40) {

				 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.2;
				 	personnelSize = 'medium';
				}
				else if (v.personnel['Personnels permanents'] > 40 
					&& v.personnel['Personnels permanents'] <= 80) {

				 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.6;
				 	personnelSize = 'large';
				}
				else 
				 	personnelSize = 'extraLarge';

				return personnelSize;
			}

			

			if (v && v.administration) {
				if (v.administration.adressesGeo) {
					v.administration.adressesGeo.forEach(function(a, i) {
						if (i === 0) 
							console.log("principale", v.administration.id);
						else
							console.log("secondaire", v.administration.id);
						
						if (v.administration['Sigle ou acronyme'].indexOf('-') > -1) {
							//need regex
							v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace(/-/g, '_');
						}

						// adjust icon size with 4 differents class (0-20, 20-40, 40-80, +80)
						//var iconSize = fixIconSize(v);

						var iconSize = 10;
						// two icons type : principal & secondaire
						// var local_icons = { 
						// 	principal: {
					 //            type: 'div',
					 //            iconSize: [iconSize, iconSize],
					 //            html: '<div></div>',
					 //            className: 'principal',
					 //            popupAnchor:  [0, -10]
					 //        },
					 //        secondaire: {
					 //            type: 'div',
					 //            iconSize: [iconSize, iconSize],
					 //            html: '<div></div>',
					 //            className: 'secondaire',
					 //            popupAnchor:  [-10, -10]
					 //        }
						// };

						var colorMarker = fixIconSize(v);

						var local_icons = {
							principal: {
					            type: 'div',
					            iconSize: [iconSize, iconSize],
					            html: '<div></div>',
					            className: colorMarker,
					            popupAnchor:  [0, -10]
					        }
						}
						
						var id = v.administration['id'].trim();
						id = id.replace(/ /g, '');

						var message = v.administration['Sigle ou acronyme'] + ' - ' + v.administration['Intitulé'];
						//console.log("message", message);
						// create all markers
						allMarkers[v.administration['id']] = {
							group: 'France',
							lat: a.lat,
			                lng: a.lon,
			                // message: message,
			                //icon: i === 0 ? local_icons.principal : local_icons.secondaire,
			                icon: local_icons.principal,
			                focus: false,
			                id: id
						};

					})
				}	
			}	
		},
		displayCenterSelected: function (item, key, $scope, leafletData, $sce) {
				console.log("item", item);
				console.log("key", key);
				// display details of center	            	
	            $scope.centerActive = true;

				// convert markdown to html
				var converter = new Showdown.converter();

				// bind center's data to tabs
				if (item.center) {
					$scope.administration = item.center.administration;

					// bind markdown data
					$scope.personnel = item.center.personnel;
					$scope.ecole = item.center.ecole;
					$scope.recherche = item.center.recherche;

					$scope.annuaire = item.center.recherche['Mots-clés sujet selon l\'annuaire du MENESR'];
					$scope.disciplinePrincipale = item.center.recherche['Discipline principale selon l\'annuaire du MENESR']
					$scope.disciplineSecondaire = item.center.recherche['Disciplines secondaires selon l\'annuaire du MENESR']
					$scope.section = item.center.recherche['Sections CNRS'];
					
					// create axes
					var axes = ''
					if (Array.isArray(item.center.recherche['Axes de recherche'])) {
						_.forEach(item.center.recherche['Axes de recherche'], function (d) {
							//console.log("d", d);
							//d = d.replace(':', ' : \n');
							axes = axes.concat(d) + ' \n';
						});
						$scope.axes = converter.makeHtml(axes)
					}
					else
						$scope.axes = converter.makeHtml(item.center.recherche['Axes de recherche']);

					// create contrats
					var contrats = ''
					if (Array.isArray(item.center.recherche['Contrats de recherche'])) {
						_.forEach(item.center.recherche['Contrats de recherche'], function (d) {
							//console.log("d", d);
							// d = d.replace(':', ' : \n');
							contrats = contrats.concat(d) + ' \n';
						});
						$scope.contrats = converter.makeHtml(contrats);
					}
					else
						$scope.contrats = converter.makeHtml(item.center.recherche['Contrats de recherche']);

					// create seminaires
					var seminaires = ''
					if (Array.isArray(item.center.recherche['Séminaires de recherche'])) {
						_.forEach(item.center.recherche['Séminaires de recherche'], function (d) {
							//console.log("d", d);
							// d = d.replace(':', ' : \n');
							seminaires = seminaires.concat(d) + ' \n';
						});
						$scope.seminaires = converter.makeHtml(seminaires);
					}
					else
						$scope.seminaires = converter.makeHtml(item.center.recherche['Séminaires de recherche']);
					//console.log("$scope.seminaires", $scope.seminaires);

					//create collaboration
					// create seminaires
					var collaboration = ''
					if (Array.isArray(item.center.recherche['Collaborations / réseaux'])) {
						_.forEach(item.center.recherche['Collaborations / réseaux'], function (d) {
							//console.log("d", d);
							// d = d.replace(':', ' : \n');
							collaboration = collaboration.concat(d) + ' \n';
						});
						$scope.collaboration = converter.makeHtml(collaboration);
					}
					else
						$scope.collaboration = converter.makeHtml(item.center.recherche['Collaborations / réseaux']);
					//console.log("$scope.collaboration", $scope.collaboration);
					
				}

				// highlight center in list
				// $scope.idSelectedCenter = null;
		        $scope.idSelectedCenter = key;

		        // check if secondaire adress exist
		        console.log("item.center.administration.adressesGeo", item.center.administration.adressesGeo);

				// open popup of center selected
		        leafletData.getMap().then(function(map) {
		        	var popup;
		        	item.center.administration.adressesGeo.forEach(function (d, i) {
		        		function fixIconSize(v) {
							console.log("v", v.personnel['Personnels permanents']);
							var personnelSize;

							if (v.personnel['Personnels permanents'] <= 20) {
							 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']);
							 	personnelSize = 'small';
							}
							else if (v.personnel['Personnels permanents'] > 20 
								&& v.personnel['Personnels permanents'] <= 40) {

							 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.2;
							 	personnelSize = 'medium';
							}
							else if (v.personnel['Personnels permanents'] > 40 
								&& v.personnel['Personnels permanents'] <= 80) {

							 	//personnelSize = Math.sqrt(v.personnel['Personnels permanents']) * 1.6;
							 	personnelSize = 'large';
							}
							else 
							 	personnelSize = 'extraLarge';

							return personnelSize;
						}

						var latlng = L.latLng(item.center.administration.adressesGeo[i].lat, 
							item.center.administration.adressesGeo[i].lon);

						// add icon
						var myIcon = L.divIcon({className: fixIconSize(item.center)});

						L.marker([item.center.administration.adressesGeo[i].lat, 
							item.center.administration.adressesGeo[i].lon],
							{icon: myIcon} )
							.addTo(map)
							.bindPopup('<p>' + item.center.administration['Intitulé'] + '</p>');


						popup = L.popup()
						    .setLatLng(latlng)
						    .setContent(item.center.administration['Intitulé'])
						    .openOn(map);

						map.addLayer(popup);

		        	})
				})

		        // highlight search in fulltxt
				$scope.highlight = function(text, search) {
				    if (!search) {
				        return $sce.trustAsHtml(text);
				    }
				    return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
				};
		}
   	}
})	