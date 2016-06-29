angular.module('map.service', [])
  .factory('mapService', function() {

    return {
		createMarkers: function (v, allMarkers) {
			function fixIconSize(v) {
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

				return iconSize;
			}

			if (v && v.administration) {
				if (v.administration.adressesGeo) {
					v.administration.adressesGeo.forEach(function(a, i) {
						
						if (v.administration['Sigle ou acronyme'].indexOf('-') > -1) {
							//need regex
							v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace(/-/g, '_');
							// v.administration['Sigle ou acronyme'] = v.administration['Sigle ou acronyme'].replace('-', '_');
						}

						// adjust icon size with 4 differents class (0-20, 20-40, 40-80, +80)
						var iconSize = fixIconSize(v);

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
						};
						
						var id = v.administration['id'].trim();
						id = id.replace(/ /g, '');

						
						// create all markers
						allMarkers[v.administration['id']] = {
							group: 'France',
							lat: a.lat,
			                lng: a.lon,
			                message: v.administration['Intitulé'],
			                icon: i === 0 ? local_icons.principal : local_icons.secondaire,
			                focus: false,
			                id: id
						};

					})
				}	
			}	
		},
		displayCenterSelected: function (item, key, $scope, leafletData, $sce) {
				console.log("item", item);
				// display details of center	            	
	            $scope.centerActive = true;
				// convert markdown to html
				var converter = new Showdown.converter();

				// bind center's data to tabs
				if (item.center) {
					$scope.administration = item.center.administration;

					$scope.personnel = item.center.personnel;
					$scope.ecole = item.center.ecole;
					$scope.recherche = item.center.recherche;
					$scope.axes = item.center.recherche['Axes de recherche'];
					$scope.annuaire = item.center.recherche['Mots-clés sujet selon l\'annuaire du MENESR'];
					$scope.disciplinePrincipale = item.center.recherche['Discipline principale selon l\'annuaire du MENESR']
					
					var axes = ''
					_.forEach($scope.axes, function (d) {
						//console.log("d", d);
						d = d.replace(':', ' : \n');
						axes = axes.concat(d) + ' \n';
					})
					// console.log("axes", axes);
					$scope.axes = converter.makeHtml(axes)
					//$scope.axes = axes;
					//console.log("$scope.axes", $scope.axes);
					$scope.contrats = item.center.recherche['Contrats de recherche'];
					//console.log("$scope.contrats", $scope.contrats);
					// var contrats = ''
					// _.forEach($scope.contrats, function (d) {
					// 	console.log("d", d);
					// 	d = d.replace(':', ' : \n');
					// 	contrats = contrats.concat(d) + ' \n';
					// })
					// // console.log("contrats", contrats);
					// $scope.contrats = converter.makeHtml(contrats)
					$scope.section = item.center.recherche['Sections CNRS'];
					$scope.seminaires = item.center.recherche['Séminaires de recherche'];
				}

				// highlight center in list
				// $scope.idSelectedCenter = null;
		        $scope.idSelectedCenter = key;

				// open popup of center selected
		        leafletData.getMap().then(function(map) {
					var latlng = L.latLng(item.center.administration.adressesGeo[0].lat, item.center.administration.adressesGeo[0].lon);
					var popup = L.popup()
					    .setLatLng(latlng)
					    .setContent(item.center.administration['Intitulé'])
					    .openOn(map);
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