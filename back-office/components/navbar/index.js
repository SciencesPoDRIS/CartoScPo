import angular from 'angular'
import './index.css'

class controller {
  constructor($http, $location, $rootScope) {
    this.$http = $http
    this.$location = $location
    this.$rootScope = $rootScope
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
    return m => !m.checkAuth || this.$rootScope.session
  }

  isActive({ url }) {
    return url === this.$location.path()
  }

  logout() {
    this.$http.post('/logout').then(() => {
      delete this.$rootScope.session
      this.$location.path('/')
    })
  }
}
controller.$inject = ['$http', '$location', '$rootScope']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular.module('bobib.navbar', []).component('navbar', component)
  .name
