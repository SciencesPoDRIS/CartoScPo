import angular from 'angular'
import logoMod from '../logo'

class controller {
  constructor($http) {
    this.center = {}
    this.$http = $http
  }

  $onInit() {
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=',
  },
}

export default angular
  .module('bobib.center-form', [logoMod])
  .component('centerForm', component).name
