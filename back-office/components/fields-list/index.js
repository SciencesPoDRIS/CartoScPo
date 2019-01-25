import angular from 'angular';
import angularDragula from 'angularjs-dragula';
import simplemdeMod from '../markdown-editor';
import './index.css';

class controller {
  static $inject = ['$scope', 'dragulaService'];

  constructor($scope, dragulaService) {
    dragulaService.options($scope, 'bag', {
      moves: (el, container, handle) => handle.className === 'handle'
    });
  }

  addField(key) {
    if (!this.item[key]) this.item[key] = [];
    this.item[key].push({});
  }

  deleteField(key, index) {
    this.item[key].splice(index, 1);
  }

  getId({ key }) {
    return this.key ? `field_${this.key}_${this.index}_${key}` : `field_${key}`;
  }

  toggleCheckList(key, option) {
    this.form.$setDirty();
    this.item[key].find(o => o === option)
      ? (this.item[key] = this.item[key].filter(o => o !== option))
      : this.item[key].push(option);
  }
}

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    fields: '<',
    item: '<',
    // to prefix recursive inputs name and id
    index: '<?',
    key: '<?',
    // ngForm for errors
    form: '<'
  }
};

export default angular
  .module('bobib.fieldsList', [angularDragula(angular), simplemdeMod])
  .component('fieldsList', component).name;
