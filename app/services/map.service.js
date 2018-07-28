/* globals angular, _, L */

angular.module('bib.services')
.factory('mapService', function($sce, leafletData) {

  var iconSize = 10;

  function fixIconSize(center) {
    var size = center.staff_permanent;
    if (!center) return '';
    if (size <= 20) return 'small';
    if (size > 20 && size <= 40) return 'medium';
    if (size > 40 && size <= 80) return 'large';
    return 'extraLarge';
  }

  return {
    createMarkers: function (centers) {
      var markers = {};
      centers.map(function (center) {
        center.addresses.forEach(function(a, i) {
          var colorMarker = fixIconSize(center);
          var id = center.id + '_' + i;
          var message = '<img style="width:20%; height:"20%;" src="img/logos/' + center.id + '.jpeg"' + '">'
            + '<p>' + center.name + ' - ' + center.acronym + '</p>'
            + '<p>'  + a.address + '</p>';

          // create one marker by address and one cluster by city
          markers[id] = {
            group: 'France', //city or France for clustering
            lat: Number(a.latitude),
            lng: Number(a.longitude),
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
      // highlight search in fulltxt
      $scope.highlight = function(text, search) {
        return !search ? $sce.trustAsHtml(text)
          : $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
      };

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
        return _.map(c.center.addresses, function () {
          c.active = true;
        });
      });
    }
  };
});
