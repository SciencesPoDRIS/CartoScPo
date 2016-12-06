'use strict';

angular.module('bib.controllers', []);
angular.module('bib.directives', []);
var app = angular.module('bib', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ngTouch',
  'ui.grid',
  'ui.grid.selection',
  'ui.grid.exporter',
  'angulartics',
  'angulartics.google.analytics',
  'nemLogging',
  'ui-leaflet',
  'bib.controllers',
  'bib.directives',
  'bib.services',
  'map.service'
])
.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
  })
  .when('/map', {
    templateUrl: 'views/map.html',
    controller: 'MapCtrl'
  })
  .when('/project', {
    templateUrl: 'views/project.html'
  })
  .when('/team', {
    template: '<br/><br/><h1>TODO team</h1>'
  })
  .otherwise({
    redirectTo: '/'
  });
});
