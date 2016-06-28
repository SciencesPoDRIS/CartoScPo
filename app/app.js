'use strict';

/*
 * Declare app level module which depends on filters, and services
 */
angular.module('bib', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ngTouch',
  // 'ngGrid', 
  // 'ui.select',
  // 'angular-loading-bar',
  'ui.grid',
  'angulartics',
  'angulartics.google.analytics',
  'nemLogging',
  'ui-leaflet',
  'bib.services',
  'bib.directives',
  'bib.controller.navbar',
  'bib.controller.home',
  'bib.controller.data',
  'map.service'
  ])

.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/', {
  	templateUrl: 'views/home.html',
    controller: 'home'
  });
  $routeProvider.when('/donnees', {

    templateUrl: 'views/data.html',
    controller: 'data'
  });
 
  $routeProvider.otherwise({redirectTo: '/'});
}])

.constant('_', _)
.constant('Elasticlunr', elasticlunr);
