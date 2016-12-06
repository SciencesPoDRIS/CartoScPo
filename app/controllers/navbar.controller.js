'use strict';

angular.module('bib.controllers')
.controller('NavbarCtrl', function($scope, $location) {
  $scope.isActive = function (view) {
    return '/' + view.slug === $location.path();
  };

  $scope.views = [
    {slug: 'accueil', label: 'Accueil'},
    {slug: 'donnees', label: 'Accès aux données'},
    {slug: 'projet', label: 'Le projet'}
  ];
});
