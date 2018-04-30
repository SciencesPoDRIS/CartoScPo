import angular from 'angular'

class controller {
  constructor(api, $location, $rootScope) {
    this.api = api
    this.$location = $location
    this.$rootScope = $rootScope

    this.user = {
      email: '',
      password: '',
    }
  }

  $onInit() {
    if (this.id) {
      this.api
        .get(`users/${this.id}`)
        .then(({ user }) => (this.user = user))
    }
  }

  submit(form) {
    if (form.$invalid) return

    const redirect = () => {
      this.$rootScope.flashes.push('Utilisateur sauvegardé')
      this.$location.path('/users')
    }
    if (this.id) {
      // edit
      this.api
        .put(`users/${this.id}`, { user: this.user })
        .then(redirect, console.error)
    } else {
      // new
      this.api
        .post('users', { user: this.user })
        .then(redirect, console.error)
    }
  }
}
controller.$inject = ['api', '$location', '$rootScope']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=?',
  },
}

export default angular
  .module('bobib.user-form', [])
  .component('userForm', component).name
