import angular from 'angular'

class controller {
  constructor($http) {
    this.users = []
    this.$http = $http
  }

  $onInit() {
    this.$http
      .get('/api/users')
      .then(({ data }) => (this.users = data.users), console.error)
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.users-list', [])
  .component('usersList', component).name
