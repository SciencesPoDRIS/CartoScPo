'use strict';

angular.module('bib.directives')
.directive('navbar', function () {
  return {
    restrict: 'EA',
    templateUrl: 'views/navbar.html',
    controller: 'NavbarCtrl'
  };
});
