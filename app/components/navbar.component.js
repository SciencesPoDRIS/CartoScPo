'use strict';

angular.module('bib.components').component('navbar', {
  templateUrl: 'views/navbar.html',
  controller: function($location, $rootScope) {
    this.isActive = function(view) {
      return (
        $location.path().indexOf('/' + $rootScope.lang + '/' + view.slug) === 0
      );
    };
    this.views = [
      { slug: 'centers', label: 'NAV_CENTERS' },
      { slug: 'project', label: 'NAV_PROJECT' },
      { slug: 'about', label: 'NAV_ABOUT' }
    ];
  }
});
