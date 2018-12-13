import angular from 'angular';

class controller {
  static $inject = ['$rootScope', '$timeout'];

  constructor($rootScope, $timeout) {
    Object.assign(this, { $rootScope, $timeout });

    this.$rootScope.flashes = [];
  }

  $onInit() {
    this.$rootScope.$watch(
      'flashes',
      () => this.$timeout(() => this.close(), 2000),
      true
    );
  }

  close() {
    this.$rootScope.flashes = [];
  }
}

const component = {
  template: `<div ng-if="$ctrl.$rootScope.flashes.length" class="container notification is-success">
  <button class="delete" ng-click="$ctrl.close()"></button>
  {{ $ctrl.$rootScope.flashes[0] }}
  </div>`,
  controller
};

export default angular.module('bobib.flash', []).component('flash', component)
  .name;
