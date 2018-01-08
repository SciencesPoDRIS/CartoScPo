import angular from 'angular'

class controller {
  constructor($http, $location, $rootScope) {
    this.$http = $http
    this.$location = $location
    this.$rootScope = $rootScope

    this.user = {
      email: '',
      password: '',
    }
  }

  submit() {
    const redirect = () => {
      this.$rootScope.flashes.push('Utilisateur créé')
      this.$location.path('/users')
    }
    this.$http.post('/api/users', { user: this.user })
    .then(redirect, console.error)
  }
}
controller.$inject = ['$http', '$location', '$rootScope']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.user-form', [])
  .component('userForm', component).name
