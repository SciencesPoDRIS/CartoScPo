import angular from 'angular'

import centerFormMod from '../center-form'
import centersListMod from '../centers-list'
import flashMod from '../flash'
import modificationsListMod from '../modifications-list'
import navbarMod from '../navbar'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.app', [
    centerFormMod,
    centersListMod,
    modificationsListMod,
    flashMod,
    navbarMod,
  ])
  .component('app', component).name
