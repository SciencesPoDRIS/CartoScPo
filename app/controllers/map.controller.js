/* globals L */
'use strict';

angular.module('bib.controllers')
.controller('MapCtrl', function($scope, leafletData) {
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
});

