import angular from 'angular'
import angularDragula from 'angularjs-dragula'
import './index.css'

class controller {
  constructor($scope, dragulaService) {
    dragulaService.options($scope, 'bag', {
      moves: (el, container, handle) => handle.className === 'handle',
    })
  }

  addField(key) {
    this.item[key].push({})
  }

  deleteField(key, index) {
    this.item[key].splice(index, 1)
  }

  toggleCheckList(key, option) {
    this.item[key].find(o => o === option)
      ? this.item[key] = this.item[key].filter(o => o !== option)
      : this.item[key].push(option)
  }
}
controller.$inject = ['$scope', 'dragulaService']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    fields: '=',
    item: '=',
  },
}

export default angular
  .module('bobib.fieldsList', [angularDragula(angular)])
  .component('fieldsList', component).name
