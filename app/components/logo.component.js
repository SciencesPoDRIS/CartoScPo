'use strict';

angular.module('bib.components')
.component('logo', {
  template: '<img ng-if="$ctrl.src" alt="logo" class="center-logo" ng-src="{{ $ctrl.src }}">',
  bindings: {
    // can't use "center", it's already taken by Leaflet
    org: '='
  },
  controller: function () {
    this.$onInit = function () {
      // example Centre Max Weber
      var src = this.org.acronym || this.org.name;
      if (src) this.src = 'img/logos_centres_de_recherche_jpeg/' + src + '.jpeg';
    }.bind(this);
  }
});
