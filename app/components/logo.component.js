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
      var admin = this.org.administration;
      // TODO the following organisations do not have a logo yet
      if (['EA 7033', 'EA 4586'].indexOf(admin['Code Unité']) !== -1) return;
      // example Centre Max Weber
      var src = admin['Acronyme (nom court)'] || admin['Intitulé'];
      if (src) this.src = 'img/logos_centres_de_recherche_jpeg/' + src + '.jpg';
    }.bind(this);
  }
});
