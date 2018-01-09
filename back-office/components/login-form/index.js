import angular from 'angular'

class controller {
  constructor($http, $location, session) {
    this.$http = $http
    this.$location = $location
    this.session = session

    this.credentials = {
      email: '',
      password: '',
    }
    this.error = false
  }

  submit() {
    this.session.login(this.credentials).catch(() => (this.error = true))
  }
}
controller.$inject = ['$http', '$location', 'session']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.login-form', [])
  .component('loginForm', component).name
