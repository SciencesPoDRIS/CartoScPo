(function() {
  'use strict';

  var supportedLangs = ['fr', 'en'];

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
      'ngAnimate',
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
        $translateProvider.useMessageFormatInterpolation();
        $translateProvider.useStaticFilesLoader({
          prefix: 'assets/i18n/',
          suffix: '.json'
        });
        $translateProvider.registerAvailableLanguageKeys(
          supportedLangs,
          _.reduce(
            supportedLangs,
            function(o, l) {
              o[l + '_*'] = l;
              o[l + '-*'] = l;
              return o;
            },
            {}
          )
        );
        $translateProvider.determinePreferredLanguage();
        $translateProvider.fallbackLanguage(supportedLangs[0]);
      }
    ])
    .config(function($routeProvider) {
      $routeProvider
        .when('/', { redirectTo: '/fr' })
        .when('/centers', { redirectTo: '/fr/centers' })
        .when('/centers/:centerId', {
          redirectTo: function(params) {
            return '/fr/centers/' + params.centerId;
          }
        })
        .when('/project', { redirectTo: '/fr/project' })
        .when('/about', { redirectTo: '/fr/about' })
        .when('/:lang', {
          templateUrl: 'views/home.html',
          controller: function(backOfficeBaseUrl) {
            this.boHref = `${backOfficeBaseUrl}/centers`;
          },
          controllerAs: '$ctrl'
        })
        .when('/:lang/centers/:centerId', {
          templateUrl: 'views/tool.html'
        })
        .when('/:lang/centers', {
          templateUrl: 'views/tool.html'
        })
        .when('/:lang/project', {
          templateUrl: 'views/project.html'
        })
        .when('/:lang/about', {
          templateUrl: 'views/about.html'
        })
        .otherwise({ redirectTo: '/' });
    })
    .run(function($rootScope, $route, $translate, $location) {
      $rootScope.urlToLang = function(lang) {
        return $location
          .path()
          .replace(/^(?:\/[a-z]{2})?(\/|$)/, '/' + lang + '$1');
      };
      $rootScope.$on('$locationChangeSuccess', function() {
        let lang = (($route.current || {}).params || {}).lang;
        if (!_.includes(supportedLangs, lang)) {
          lang = supportedLangs[0];
        }
        if ($rootScope.lang !== lang) {
          $rootScope.lang = lang;
          $translate.use(lang).then(function() {
            document.title = $translate.instant('TITLE');
          });
        }
      });
    });
})();
