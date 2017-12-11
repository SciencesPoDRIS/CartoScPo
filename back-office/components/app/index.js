import angular from 'angular'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular.module('bobib.app', []).component('app', component).name
