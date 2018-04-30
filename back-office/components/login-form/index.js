import angular from 'angular'

class controller {
  constructor(session) {
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
controller.$inject = ['session']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.login-form', [])
  .component('loginForm', component).name
