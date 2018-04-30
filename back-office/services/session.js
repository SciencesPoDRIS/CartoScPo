import angular from 'angular'

class Service {
  constructor($http, $location, $rootScope) {
    this.$http = $http
    this.$location = $location
    this.$rootScope = $rootScope

    // check this var for connected / disconnected in ctrls and templates
    this.email = ''
    this.refresh()
  }

  refresh() {
    return this.$http
      .get(`session`)
      .then(({ data }) => (this.email = data), () => (this.email = ''))
  }

  login(credentials) {
    const redirect = () => {
      this.email = credentials.email
      this.$rootScope.flashes.push('Connexion réussie')
      this.$location.path('/centers')
    }
    return this.$http.post(`login`, credentials).then(redirect)
  }

  logout() {
    return this.$http.post(`logout`).then(() => {
      this.email = ''
      this.$location.path('/')
    })
  }
}
Service.$inject = ['$http', '$location', '$rootScope']

export default angular.module('bobib.session', []).service('session', Service)
  .name
