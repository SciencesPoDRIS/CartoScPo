import angular from 'angular'
import './index.css'

class controller {
  $onInit() {
    const { acronym: src } = this.center
    // TODO
    if (src)
      this.src = `http://cartosciencepolitique.sciencespo.fr/img/logos_centres_de_recherche_jpeg/${src}.jpeg`
  }
}

const component = {
  template:
    '<img ng-if="$ctrl.src" alt="center logo" class="center-logo" ng-src="{{ $ctrl.src }}">',
  controller,
  bindings: {
    center: '=',
  },
}

export default angular.module('bobib.logo', []).component('logo', component)
  .name
