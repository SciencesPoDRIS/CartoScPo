import angular from 'angular'

class controller {
  constructor(api) {
    this.users = []
    this.api = api
  }

  $onInit() {
    this.getUsers()
  }

  getUsers() {
    this.api
      .get('users')
      .then(({ users }) => (this.users = users), console.error)
  }

  delete(user) {
    if (window.confirm(`Etes vous sur de supprimer ${user.email} ?`)) {
      this.api.delete(`users/${user.id}`).then(() => this.getUsers())
    }
  }
}
controller.$inject = ['api']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.users-list', [])
  .component('usersList', component).name
