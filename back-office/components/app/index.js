import angular from 'angular'

import centerFormMod from '../center-form'
import centersListMod from '../centers-list'
import loginFormMod from '../login-form'
import flashMod from '../flash'
import modificationDetailsMod from '../modification-details'
import modificationsListMod from '../modifications-list'
import navbarMod from '../navbar'
import userFormMod from '../user-form'
import usersListMod from '../users-list'

class controller {}

const component = {
  template: require('./index.html'),
  controller,
}

export default angular
  .module('bobib.app', [
    centerFormMod,
    centersListMod,
    loginFormMod,
    modificationDetailsMod,
    modificationsListMod,
    flashMod,
    navbarMod,
    userFormMod,
    usersListMod,
  ])
  .component('app', component).name
