import angular from 'angular'
import logoMod from '../logo'
import './index.css'

class controller {
  constructor($log, api, session) {
    Object.assign(this, { $log, api, session })

    this.centers = []

    this.search = {}
    this.orderBy = 'acronym'
    this.orderByAsc = true
  }

  $onInit() {
    this.loading = true
    this.api
      .get('centers')
      .then(({ centers }) => (this.centers = centers), this.$log.error)
      .then(() => (this.loading = false))
  }

  sort(field) {
    this.orderBy = field
    this.orderByAsc = !this.orderByAsc
  }
}
controller.$inject = ['$log', 'api', 'session']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.centers-list', [logoMod])
  .component('centersList', component).name
