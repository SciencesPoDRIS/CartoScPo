import angular from 'angular'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular.module('bobib.centers', []).component('centers', component).name

