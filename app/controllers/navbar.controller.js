'use strict';

/* Controllers */

angular.module('bib.controller.navbar', [])
  .controller('navbar', [ "$scope", "$location", 
  	function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.views = [
      {slug: "accueil", label: "Accueil"},
      {slug: "donnees", label: "Accès aux données"},
      {slug: "projet", label: "Le projet"}
    ];
  }])