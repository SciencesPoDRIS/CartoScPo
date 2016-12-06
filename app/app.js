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
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/accueil', {
            templateUrl: 'views/home.html',
            controller: 'home'
        })
        .when('/donnees', {
            templateUrl: 'views/data.html',
            controller: 'data'
        })
        .when('/projet', {
            templateUrl: 'views/methodologie.html',
            controller: 'methodologie'
        })
        .otherwise({
            redirectTo: '/accueil'
        });
}]);

app.constant('_', _);
