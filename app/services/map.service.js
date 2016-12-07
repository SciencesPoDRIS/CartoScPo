angular.module('bib.services')
  .factory('mapService', function($sce, leafletData) {

    var iconSize = 10;

    function fixIconSize(center) {
      var size = center.personnel['Personnels permanents'];
      if (!center) return '';
      if (size <= 20) return 'small';
      if (size > 20 && size <= 40) return 'medium';
      if (size > 40 && size <= 80) return 'large';
      return 'extraLarge';
    }

    return {
        createMarkers: function (centers) {
          var markers = {};
          _.forIn(centers, function (center) {
            _.get(center, 'administration.adressesGeo', []).forEach(function(a, i) {
              var colorMarker = fixIconSize(center);
              var id = center.administration.id.trim().replace(/( |;|\n|_)/g, '') + '_' + i;

              //create message for the popup
              var message = '<img style="width:20%; height:"20%;" src="./img/logos_centres_de_recherche_jpeg/' + center.administration['Acronyme (nom court)'] + '.jpg"' + '">'
                + '<p>' + center.administration['Intitulé'] + ' - ' + center.administration['Acronyme (nom court)'] + '</p>'
                + '<p>'  + a.adresse + '</p>';

              // create one marker by adress and one cluster by city
              markers[id] = {
                group: 'France', //city or France for clustering
                lat: a.lat,
                lng: a.lon,
                message: message,
                icon: {
                  type: 'div',
                  iconSize: [iconSize, iconSize],
                  html: '<div></div>',
                  className: colorMarker,
                  popupAnchor:  [0, -10]
                },
                focus: false,
                id: id
              };
            });
          });
          return markers;
        },

        displayCenterSelected: function (item, key, keyCenter, $scope) {
            // display details of center
            $scope.centerActive = true;

            // convert markdown to html
            var converter = new Showdown.converter();

            // bind center's data to tabs
            if (item && item.center) {
                // bind markdown data
                $scope.administration = item.center.administration;
                $scope.link = './img/logos_centres_de_recherche_jpeg/' + item.center.administration['Acronyme (nom court)'] + '.jpg';
                $scope.sigle = item.center.administration['Acronyme (nom court)'];
                $scope.personnel = item.center.personnel;
                $scope.personnelCNRSUrl = item.center.personnel['Lien vers la page "personnel" du site Web du CNRS'];
                $scope.personnelSiteWebCentre = item.center.personnel['Lien vers la page "personnel" sur le site Web du centre'];
                $scope.ecole = item.center.ecole;
                $scope.recherche = item.center.recherche;
                $scope.annuaire = item.center.recherche['Mots-clés sujet selon l\'annuaire du MENESR'];
                $scope.disciplinePrincipale = item.center.recherche['Discipline principale selon l\'annuaire du MENESR'];
                $scope.disciplineSecondaire = item.center.recherche['Disciplines secondaires selon l\'annuaire du MENESR'];
                $scope.section = item.center.recherche['Sections CNRS'];

                $scope.ressources = item.center.ressources;

                $scope.ressourcesDesciption = converter.makeHtml(item.center.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);

                $scope.ressourcesIntitule = item.center.ressources['Centre de documentation ou bibliothèque en propre : Intitulé'];
                $scope.ressourcesSiteWeb = item.center.ressources['Site Web'];

                $scope.publications = item.center.publication;

                $scope.etablissements = item.center.administration['Etablissements de rattachement'].split(';');

                // create axes
                var axes = '';
                if (Array.isArray(item.center.recherche['Axes de recherche'])) {
                    _.forEach(item.center.recherche['Axes de recherche'], function (d) {
                        axes = axes.concat(d) + ' \n';
                    });
                    $scope.axes = converter.makeHtml(axes);
                }
                else
                    $scope.axes = converter.makeHtml(item.center.recherche['Axes de recherche']);

                // create contrats
                var contrats = '';
                if (Array.isArray(item.center.recherche['Contrats de recherche'])) {
                    _.forEach(item.center.recherche['Contrats de recherche'], function (d) {
                        contrats = contrats.concat(d) + ' \n';
                    });
                    $scope.contrats = converter.makeHtml(contrats);
                }
                else
                    $scope.contrats = converter.makeHtml(item.center.recherche['Contrats de recherche']);

                // create seminaires
                var seminaires = '';
                if (Array.isArray(item.center.recherche['Séminaires de recherche'])) {
                    _.forEach(item.center.recherche['Séminaires de recherche'], function (d) {
                        seminaires = seminaires.concat(d) + ' \n';
                    });
                    $scope.seminaires = converter.makeHtml(seminaires);
                }
                else
                    $scope.seminaires = converter.makeHtml(item.center.recherche['Séminaires de recherche']);

                // create collaboration
                // create seminaires
                var collaboration = '';
                if (Array.isArray(item.center.recherche['Collaborations / réseaux'])) {
                    _.forEach(item.center.recherche['Collaborations / réseaux'], function (d) {
                        collaboration = collaboration.concat(d) + ' \n';
                    });
                    $scope.collaboration = converter.makeHtml(collaboration);
                }
                else
                    $scope.collaboration = converter.makeHtml(item.center.recherche['Collaborations / réseaux']);

                if (item.center.recherche['Mots-clés sujet selon l\'annuaire du MENESR'])
                    $scope.motsClefs = item.center.recherche['Mots-clés sujet selon l\'annuaire du MENESR'].split(';');
            }

            // highlight search in fulltxt
            $scope.highlight = function(text, search) {
              return !search ? $sce.trustAsHtml(text)
                : $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
            };

            // highlight center in list
            $scope.idSelectedCenter = keyCenter;
            //$("#listCenters").scroll($('#' + key));

            // open popup of center selected only if adress click, not navigation
            leafletData.getMap().then(function(map) {
                // display all adresses available
                var id_center = item.center.administration.id.replace(/ /g,"");
                var marker_keys = item.center.administration.adressesGeo.map(function(a,i) {
                    return id_center + '_' + i;
                });

                // create popup
                var showPopup = function(marker_key) {
                    // get the marker
                    var marker = $scope.markers[marker_key],
                        content = marker.message,
                        latLng = [marker.lat, marker.lng],
                        popup = L.popup({ className : 'custom-popup' }).setContent(content).setLatLng(latLng);
                    leafletData.getMap().then(function(map) {
                        popup.openOn(map);
                    });
                };

                // get the key === adress position
                if (key !== null)
                    showPopup(id_center+'_'+key);
            });
        },

        setAllAdressActive: function(allCenters) {
         _.map(allCenters, function(c) {
                return _.map(c.center.administration.adressesGeo, function (a) {
                    c.active = true;
                });
            });
        }
    };
});
