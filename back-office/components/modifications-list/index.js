import angular from 'angular';

class controller {
  static $inject = ['$log', 'api'];

  constructor($log, api) {
    Object.assign(this, { $log, api });

    this.modifications = [];
  }

  $onInit() {
    this.api
      .get('modifications')
      .then(
        ({ modifications }) => (this.modifications = modifications),
        this.$log.error
      );
  }
}

const component = {
  template: require('./index.html'),
  controller
};

export default angular
  .module('bobib.modifications-list', [])
  .component('modificationsList', component).name;
