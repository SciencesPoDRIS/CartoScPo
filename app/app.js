(function() {
  'use strict';

  angular.module('bib.components', []);
  angular.module('bib.controllers', []);
  angular.module('bib.services', []);

  /* Google analytics configuration */
  angular
    .module('bib.analytics', ['angular-google-analytics', 'bib.conf'])
    .config([
      'AnalyticsProvider',
      'googleAnalyticsId',
      function(AnalyticsProvider, googleAnalyticsId) {
        AnalyticsProvider.setAccount(googleAnalyticsId);
      }
    ])
    .run(['Analytics', function() {}]);

  angular
    .module('bib', [
      'ngRoute',
      'ngSanitize',
      'ui.bootstrap',
      'ui.grid',
      'ui.grid.selection',
      'ui.grid.exporter',
      'ui.select',
      'ngTouch',
      'ui-leaflet',
      'bib.components',
      'bib.controllers',
      'bib.services',
      'bib.analytics'
    ])
    .config(function($httpProvider, $locationProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
      $locationProvider.hashPrefix('');
    })
    .config(function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html'
        })
        .when('/centers/:centerId', {
          templateUrl: 'views/tool.html'
        })
        .when('/centers', {
          templateUrl: 'views/tool.html'
        })
        .when('/project', {
          templateUrl: 'views/project.html'
        })
        .when('/about', {
          templateUrl: 'views/about.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    });
})();
