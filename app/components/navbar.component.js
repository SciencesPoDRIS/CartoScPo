'use strict';

angular.module('bib.components')
.component('navbar', {
  templateUrl: 'views/navbar.html',
  controller: function ($location) {
    this.isActive = function (view) {
      return '/' + view.slug === $location.path();
    };

    this.views = [
      {slug: 'centers', label: 'Cartographie de la Science Politique en France'},
      {slug: 'project', label: 'Le projet'},
      {slug: 'team', label: 'L\'équipe'}
    ];
  }
});

