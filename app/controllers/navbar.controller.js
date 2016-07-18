'use strict';

/* Controllers */

angular.module('bib.controller.navbar', [])
  .controller('navbar', [ "$scope", "$location", 
  	function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.views = [
      {slug: "donnees", label: "Accès aux données"},
      {slug: "methodologie", label: "Méthodologie"},
      {slug: "accessibilite", label: "Accessibilité"},
      {slug: "contact", label: "Contact"}
    ];
  }])