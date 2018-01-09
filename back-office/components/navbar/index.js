import angular from 'angular'
import './index.css'

class controller {
  constructor($http, $location, session) {
    this.$http = $http
    this.$location = $location
    this.session = session
  }

  $onInit() {
    this.menus = [
      { url: '/home', label: 'Home' },
      { url: '/centers', label: 'Centres' },
      { url: '/modifications', label: 'Modifications', checkAuth: true },
      { url: '/users', label: 'Utilisateurs', checkAuth: true },
    ]
  }

  checkAuth() {
    return m => !m.checkAuth || this.session.email
  }

  isActive({ url }) {
    return url === this.$location.path()
  }

  logout() {
    this.session.logout()
  }
}
controller.$inject = ['$http', '$location', 'session']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular.module('bobib.navbar', []).component('navbar', component)
  .name
