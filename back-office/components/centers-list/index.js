import angular from 'angular'
import logoMod from '../logo'
import './index.css'

class controller {
  constructor($http) {
    this.centers = []
    this.$http = $http

    this.search = {}
    this.orderBy = 'acronym'
  }

  $onInit() {
    this.loading = true
    this.$http
      .get('/api/centers')
      .then(({ data }) => (this.centers = data.centers), console.error)
      .then(() => this.loading = false)
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
