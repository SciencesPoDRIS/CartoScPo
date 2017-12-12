import angular from 'angular'

class controller {
  constructor($location) {
    this.$location = $location
  }

  $onInit() {
    this.menus = [
      { url: '/home', label: 'Home' },
      { url: '/centers', label: 'Centres' },
      { url: '/modifications', label: 'Modifications' },
      { url: '/users', label: 'Utilisateurs' },
    ]
  }

  isActive({ url }) {
    return url === this.$location.path()
  }
}
controller.$inject = ['$location']

const component = {
  template: require('./index.html'),
  controller,
}

export default angular.module('bobib.navbar', []).component('navbar', component)
  .name
