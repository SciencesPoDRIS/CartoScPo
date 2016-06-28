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
						console.log("iconSize", iconSize);

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
		}
   	}

})	