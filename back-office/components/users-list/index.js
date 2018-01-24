import angular from 'angular'

class controller {
  constructor($http) {
    this.users = []
    this.$http = $http
  }

  $onInit() {
    this.getUsers()
  }

  getUsers() {
    this.$http
      .get('/api/users')
      .then(({ data }) => (this.users = data.users), console.error)
  }

  delete(user) {
    if (window.confirm(`Etes vous sur de supprimer ${user.email} ?`)) {
      this.$http.delete(`/api/users/${user.email}`).then(() => this.getUsers())
    }
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
