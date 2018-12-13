import angular from 'angular';
import './index.css';

class controller {
  static $inject = ['$location', 'session'];

  constructor($location, session) {
    Object.assign(this, { $location, session });
  }

  $onInit() {
    this.menus = [
      { url: 'home', label: 'Home' },
      { url: 'centers', label: 'Centres' },
      { url: 'modifications', label: 'Modifications', checkAuth: true },
      { url: 'users', label: 'Utilisateurs', checkAuth: true }
    ];
  }

  checkAuth() {
    return m => !m.checkAuth || this.session.email;
  }

  isActive({ url }) {
    return url === this.$location.path();
  }

  logout() {
    this.session.logout();
  }
}

const component = {
  template: require('./index.html'),
  controller
};

export default angular.module('bobib.navbar', []).component('navbar', component)
  .name;
