import angular from 'angular'

class controller {
  constructor($http) {
    this.centers = []
    this.$http = $http
  }

  $onInit() {
    this.$http
      .get('/api/centers')
      .then(({ data }) => (this.centers = data.centers))
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.centers', [])
  .component('centers', component).name
