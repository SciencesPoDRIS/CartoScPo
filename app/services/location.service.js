/**
 * Add skipReload() to $location service.
 *
 * See https://github.com/angular/angular.js/issues/1699
 */
angular.module('bib.services').factory('location', [
  '$rootScope',
  '$route',
  '$location',
  function($rootScope, $route, $location) {
    $location.skipReload = function() {
      var lastRoute = $route.current;

      var deregister = $rootScope.$on('$locationChangeSuccess', function(
        e,
        absUrl,
        oldUrl
      ) {
        console.log(
          'location.skipReload',
          'absUrl:',
          absUrl,
          'oldUrl:',
          oldUrl
        );
        $route.current = lastRoute;
        deregister();
      });

      return $location;
    };

    return $location;
  }
]);
