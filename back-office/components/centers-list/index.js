import angular from 'angular'
import logoMod from '../logo'
import './index.css'

class controller {
  constructor(api) {
    this.centers = []
    this.api = api

    this.search = {}
    this.orderBy = 'acronym'
    this.orderByAsc = true
  }

  $onInit() {
    this.loading = true
    this.api
      .get('centers')
      .then(({ centers }) => (this.centers = centers), console.error)
      .then(() => this.loading = false)
  }

  sort(field) {
    this.orderBy = field
    this.orderByAsc = !this.orderByAsc
  }
}
controller.$inject = ['api']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.centers-list', [logoMod])
  .component('centersList', component).name
