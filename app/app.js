'use strict';

angular.module('bib.controllers', []);
angular.module('bib.directives', []);
angular.module('bib.services', []);
angular.module('bib', [
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
  'bib.services'
])
.config(function ($httpProvider) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
  })
  .when('/map', {
    templateUrl: 'views/tool.html',
    controller: 'ToolCtrl'
  })
  .when('/project', {
    templateUrl: 'views/project.html'
  })
  .when('/team', {
    templateUrl: 'views/team.html'
  })
  .otherwise({
    redirectTo: '/'
  });
});
