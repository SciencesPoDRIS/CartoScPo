'use strict';

angular.module('bib.controllers')
.controller('NavbarCtrl', function($scope, $location) {
  $scope.isActive = function (view) {
    return '/' + view.slug === $location.path();
  };

  $scope.views = [
    {slug: '', label: ''},
    {slug: 'map', label: 'Cartographie de la Science Politique en France'},
    {slug: 'project', label: 'Le projet'},
    {slug: 'team', label: 'L\'équipe'}
  ];
});
