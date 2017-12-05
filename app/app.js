'use strict';

angular.module('bib.components', []);
angular.module('bib.controllers', []);
angular.module('bib.services', []);
angular.module('bib', [
        'ngRoute',
        'ngSanitize',
        'ng-showdown',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.exporter',
        'ui.select',
        'ngTouch',
        'angulartics',
        'angulartics.google.analytics',
        'ui-leaflet',
        'bib.components',
        'bib.controllers',
        'bib.services'
    ])
    .config(function($httpProvider, $locationProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $locationProvider.hashPrefix('');
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
            .when('/about', {
                templateUrl: 'views/about.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
angular.module('bib.analytics', ['angular-google-analytics', 'ngRoute'])
    .config(['AnalyticsProvider', function (AnalyticsProvider) {
        // Add configuration code as desired
        AnalyticsProvider.setAccount('UA-2835049-22')
            // Track all URL query params (default is false).
            .trackUrlParams(true)
            // Activate reading custom tracking urls from $routeProvider config (default is false)
            .readFromRoute(true);
    }])
    .run(['Analytics', function(Analytics) { }]);
