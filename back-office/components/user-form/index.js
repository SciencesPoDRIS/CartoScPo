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

  $onInit() {
    if (this.id) {
      this.$http
        .get(`/api/users/${this.id}`)
        .then(({ data }) => (this.user = data.user))
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
      this.$http
        .put(`/api/users/${this.id}`, { user: this.user })
        .then(redirect, console.error)
    } else {
      // new
      this.$http
        .post('/api/users', { user: this.user })
        .then(redirect, console.error)
    }
  }
}
controller.$inject = ['$http', '$location', '$rootScope']

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
