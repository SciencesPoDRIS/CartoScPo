import angular from 'angular'

class controller {
  constructor(api) {
    this.api = api
    this.modifications = []
  }

  $onInit() {
    this.api
      .get('modifications')
      .then(({ modifications }) => (this.modifications = modifications), console.error)
  }
}
controller.$inject = ['api']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.modifications-list', [])
  .component('modificationsList', component).name
