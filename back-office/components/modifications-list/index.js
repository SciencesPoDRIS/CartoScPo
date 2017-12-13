import angular from 'angular'

class controller {
  constructor($http) {
    this.modifications = []
    this.$http = $http
  }

  $onInit() {
    this.$http
      .get('/api/modifications')
      .then(({ data }) => (this.modifications = data.modifications), console.error)
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.modifications-list', [])
  .component('modificationsList', component).name
