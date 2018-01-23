import angular from 'angular'
import logoMod from '../logo'
import './index.css'

class controller {
  constructor($http) {
    this.centers = []
    this.$http = $http

    this.search = {}
    this.orderBy = 'acronym'
    this.orderByAsc = true
  }

  $onInit() {
    this.loading = true
    this.$http
      .get('/api/centers')
      .then(({ data }) => (this.centers = data.centers), console.error)
      .then(() => this.loading = false)
  }

  sort(field) {
    this.orderBy = field
    this.orderByAsc = !this.orderByAsc
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
