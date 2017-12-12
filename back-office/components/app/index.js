import angular from 'angular'

import centersMod from '../centers'
import navbarMod from '../navbar'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.app', [centersMod, navbarMod])
  .component('app', component).name
