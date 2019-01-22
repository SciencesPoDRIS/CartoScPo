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
      'pascalprecht.translate',
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
    .config([
      '$translateProvider',
      function($translateProvider) {
        $translateProvider.useStaticFilesLoader({
          prefix: 'assets/i18n/',
          suffix: '.json'
        });
        $translateProvider.registerAvailableLanguageKeys(['fr', 'en'], {
          'en_*': 'en',
          'en-*': 'en',
          'fr_*': 'fr',
          'fr-*': 'fr',
          '*': 'fr' // final fallback
        });
        $translateProvider.determinePreferredLanguage();
      }
    ])
    .config(function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html',
          controller: function(backOfficeBaseUrl) {
            this.boHref = `${backOfficeBaseUrl}/centers`;
          },
          controllerAs: '$ctrl'
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
