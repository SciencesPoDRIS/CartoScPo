import angular from 'angular'

class controller {
  constructor($log, api) {
    Object.assign(this, { $log, api })

    this.modifications = []
  }

  $onInit() {
    this.api
      .get('modifications')
      .then(
        ({ modifications }) => (this.modifications = modifications),
        this.$log.error,
      )
  }
}
controller.$inject = ['$log', 'api']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.modifications-list', [])
  .component('modificationsList', component).name
