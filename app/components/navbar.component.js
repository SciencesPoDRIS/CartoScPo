'use strict';

angular.module('bib.components').component('navbar', {
  templateUrl: 'views/navbar.html',
  controller: function($location) {
    this.isActive = function(view) {
      return $location.path().indexOf('/' + view.slug) === 0;
    };
    this.views = [
      { slug: 'centers', label: 'Accéder aux centres' },
      { slug: 'project', label: 'Le projet' },
      { slug: 'about', label: 'A propos' }
    ];
  }
});
