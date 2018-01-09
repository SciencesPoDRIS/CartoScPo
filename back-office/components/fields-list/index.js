import angular from 'angular'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    fields: '=',
    item: '=',
  },
}

export default angular
  .module('bobib.fieldsList', [])
  .component('fieldsList', component).name
