import angular from 'angular'
import logoMod from '../logo'

class controller {
  constructor($http) {
    this.centers = []
    this.$http = $http
  }

  $onInit() {
    this.$http
      .get('/api/centers')
      .then(({ data }) => (this.centers = data.centers), console.error)
  }

  toggleVisibility(center) {
    this.$http
      .patch(`/api/centers/${center.id}/visibility`)
      .then(({ data }) => (center.hidden = data.hidden), console.error)
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.centers-list', [logoMod])
  .component('centersList', component).name
