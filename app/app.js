'use strict';

/*
 * Declare app level module which depends on filters, and services
 */
angular.module('bib', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ngGrid',
  // 'ui.select',
  // 'angular-loading-bar',
  'angulartics',
  'angulartics.google.analytics',
  'nemLogging',
  'ui-leaflet',
  'bib.services',
  'bib.directives',
  'bib.controller.navbar',
  'bib.controller.home'
  ])

.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/', {
  	templateUrl: 'views/home.html',
    controller: 'home'
  });
  // $routeProvider.when('/home', {
  //   templateUrl: 'views/home.html',
  //   controller: 'home'
  // });
 
  $routeProvider.otherwise({redirectTo: '/'});
}])

.constant('_', _)
.constant('Elasticlunr', elasticlunr);
