import angular from 'angular'

import centerFormMod from '../center-form'
import centersListMod from '../centers-list'
import flashMod from '../flash'
import navbarMod from '../navbar'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.app', [centerFormMod, centersListMod, flashMod, navbarMod])
  .component('app', component).name
