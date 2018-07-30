import angular from 'angular'
import './index.css'

class controller {
  $onInit() {
    const { id: src } = this.center
    // available on the front-office
    if (src)
      this.src = `/img/logos/${src}.jpeg`
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
