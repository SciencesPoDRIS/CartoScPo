/* globals Showdown, L */

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
      _.forIn(centers, function (center, centerId) {
        _.get(center, 'administration.addressesGeo', []).forEach(function(a, i) {
          var colorMarker = fixIconSize(center);
          var id = centerId + '_' + i;
          var message = '<img style="width:20%; height:"20%;" src="img/logos_centres_de_recherche_jpeg/' + center.administration['Acronyme (nom court)'] + '.jpg"' + '">'
            + '<p>' + center.administration['Intitulé'] + ' - ' + center.administration['Acronyme (nom court)'] + '</p>'
            + '<p>'  + a.address + '</p>';

          // create one marker by address and one cluster by city
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
      // convert markdown to html
      var converter = new Showdown.converter();

      // bind center's data to tabs
      if (item && item.center) {
        // bind markdown data
        $scope.ressourcesDescription = converter.makeHtml(item.center.ressources['Centre de documentation ou bibliothèque en propre : description et fonds spécifiques']);

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
        var collaboration = '';
        if (Array.isArray(item.center.recherche['Collaborations / réseaux'])) {
          _.forEach(item.center.recherche['Collaborations / réseaux'], function (d) {
            collaboration = collaboration.concat(d) + ' \n';
          });
          $scope.collaboration = converter.makeHtml(collaboration);
        }
        else
          $scope.collaboration = converter.makeHtml(item.center.recherche['Collaborations / réseaux']);
      }

      // highlight search in fulltxt
      $scope.highlight = function(text, search) {
        return !search ? $sce.trustAsHtml(text)
          : $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
      };

      // highlight center in list
      $scope.idSelectedCenter = keyCenter;

      // open popup of center selected only if address click, not navigation
      leafletData.getMap().then(function() {
        // display all addresses available
        var id_center = item.center.administration.id.replace(/ /g, '');

        // create popup
        var showPopup = function(marker_key) {
          // get the marker
          var marker = $scope.markers[marker_key];
          var popup = L.popup({ className : 'custom-popup' })
            .setContent(marker.message)
            .setLatLng([marker.lat, marker.lng]);
          leafletData.getMap().then(function(map) {
            popup.openOn(map);
          });
        };

        // get the key === address position
        if (key !== null)
          showPopup(id_center+'_'+key);
      });
    },

    setAllAddressActive: function(allCenters) {
      _.map(allCenters, function(c) {
        return _.map(c.center.administration.addressesGeo, function () {
          c.active = true;
        });
      });
    }
  };
});
