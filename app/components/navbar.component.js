'use strict';

angular.module('bib.components').component('navbar', {
  templateUrl: 'views/navbar.html',
  controller: function($location) {
    this.isActive = function(view) {
      return $location.path().indexOf('/' + view.slug) === 0;
    };
    this.views = [
      { slug: 'centers', label: 'NAV_CENTERS' },
      { slug: 'project', label: 'NAV_PROJECT' },
      { slug: 'about', label: 'NAV_ABOUT' }
    ];
  }
});
