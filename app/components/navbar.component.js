'use strict';

angular.module('bib.components').component('navbar', {
  templateUrl: 'views/navbar.html',
  controller: function($location, $translate) {
    this.isActive = function(view) {
      return $location.path().indexOf('/' + view.slug) === 0;
    };
    this.views = [
      { slug: 'centers', label: $translate.instant('NAV_CENTERS') },
      { slug: 'project', label: $translate.instant('NAV_PROJECT') },
      { slug: 'about', label: $translate.instant('NAV_ABOUT') }
    ];
  }
});
