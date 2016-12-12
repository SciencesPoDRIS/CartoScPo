/* globals L */
'use strict';

angular.module('bib.controllers')
.controller('MapCtrl', function($scope, leafletData, leafletMarkerEvents, mapService) {
  // add custom legend
  leafletData.getMap().then(function(map) {
    var MyControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
      onAdd: function() {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'my-custom-control');
        container.innerHTML = '<svg width="250" height="150"> ' +
          '<text x="15" y="100" fill="black" font-size="14">Nombre de chercheurs permanents</text>' +
          '<rect width="30" height="30" x="105" y="110" fill="#e74c3c" />' +
          '<text x="130" y="150" fill="black">+ 80</text>' +
          '<rect width="30" height="30" x="75" y="110" fill="#d35400" />' +
          '<text x="100" y="150" fill="black">80</text>' +
          '<rect width="30" height="30" x="45" y="110" fill="#e67e22" />' +
          '<text x="70" y="150" fill="black">40</text>' +
          '<rect width="30" height="30" x="15" y="110" fill="#f1c40f" />' +
          '<text x="40" y="150" fill="black">20</text>' + '</svg>';
        return container;
      }
    });
    map.addControl(new MyControl());
  });

  // display map with markers choosen
  $scope.initMap = function() {
    mapService.setAllAddressActive($scope.allCenters);
  };

  $scope.zoomFrance = function() {
    angular.extend($scope, {
      markers: $scope.allMarkers,
      leafletCenter: {
        lat: 46.227638,
        lng: 2.213749,
        zoom: 6
      },
      position: {
        lat: 51,
        lng: 0,
        zoom: 4
      },
      events: { // or just {} //all events
        markers: {
          enable: ['click', 'mouseover', 'mouseout'],
          logic: 'broadcast'
        }
      }
    });
  };

  // default <leaflet> attrs

  $scope.layers = {
    baselayers: {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        type: 'xyz'
      }
    }
  };

  $scope.leafletCenter = {
    lat: 46.22545288226939,
    lng: 3.3618164062499996,
    zoom: 2
  };

  // catch map events
  $scope.events = {
    markers: {
      enable: leafletMarkerEvents.getAvailableEvents(),
    }
  };

  // detect event on markers and display or close popup
  leafletMarkerEvents.getAvailableEvents().forEach(function (eventType) {
    $scope.$on('leafletMarker.' + eventType, function(event, args) {
      var target = args.leafletEvent.target;
      if (event.name === 'leafletMarker.click') {
        target.openPopup();
      }
      if (event.name === 'leafletMarker.mouseover') {
        target.openPopup();
      }
      if (event.name === 'leafletMarker.mouseout') {
        target.closePopup();
      }
    });
  });

});

