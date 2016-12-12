'use strict';

angular.module('bib.controllers', []);
angular.module('bib.directives', []);
angular.module('bib.services', []);
angular.module('bib', [
  'ngRoute',
  'ngSanitize',
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.selection',
  'ui.grid.exporter',
  'ui.select',
  'ngTouch',
  'angulartics',
  'angulartics.google.analytics',
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
  .when('/centers/:centerId', {
    templateUrl: 'views/tool.html',
  })
  .when('/centers', {
    templateUrl: 'views/tool.html',
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
