import angular from 'angular'

class controller {
  static $inject = ['$log', '$location', '$rootScope', 'api']

  constructor($log, $location, $rootScope, api) {
    Object.assign(this, { $log, $location, $rootScope, api })

    this.user = {
      email: '',
      password: '',
    }
  }

  $onInit() {
    if (this.id) {
      this.api.get(`users/${this.id}`).then(({ user }) => (this.user = user))
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
        .then(redirect, this.$log.error)
    } else {
      // new
      this.api
        .post('users', { user: this.user })
        .then(redirect, this.$log.error)
    }
  }
}

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
