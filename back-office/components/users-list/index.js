import angular from 'angular'

class controller {
  constructor($log, api) {
    Object.assign(this, { $log, api })

    this.users = []
  }

  $onInit() {
    this.getUsers()
  }

  getUsers() {
    this.api
      .get('users')
      .then(({ users }) => (this.users = users), this.$log.error)
  }

  delete(user) {
    if (window.confirm(`Êtes vous sur de supprimer ${user.email} ?`)) {
      this.api.delete(`users/${user.id}`).then(() => this.getUsers())
    }
  }
}
controller.$inject = ['$log', 'api']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.users-list', [])
  .component('usersList', component).name
