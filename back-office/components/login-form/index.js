import angular from 'angular'

class controller {
  constructor($http, $location, $rootScope) {
    this.$http = $http
    this.$location = $location
    this.$rootScope = $rootScope

    this.login = {
      email: '',
      password: '',
    }
    this.error = false
  }

  submit() {
    const redirect = () => {
      this.$rootScope.session = this.login.email
      this.$rootScope.flashes.push('Connexion réussie')
      this.$location.path('/centers')
    }
    this.$http.post(`/login`, this.login)
    .then(redirect, () => this.error = true)
  }
}
controller.$inject = ['$http', '$location', '$rootScope']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.login-form', [])
  .component('loginForm', component).name
