'use strict';

/* Directives */

angular.module('bib.directive.navbar', [])

  .directive('navbar',[ 'fileService', '$timeout', function (fileService, $timeout){
    return {
      restrict: 'A',
      replace: false,
      templateUrl: 'views/navbar.html',
      link: function(scope, element, attrs) {
      	
      }
    }
  }])