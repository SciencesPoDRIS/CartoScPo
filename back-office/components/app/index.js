import angular from 'angular'
import centersMod from '../centers'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.app', [centersMod])
  .component('app', component).name
