import angular from 'angular'
import './index.css'

class controller {
  addField(key) {
    this.item[key].push({})
  }

  deleteField(key, index) {
    this.item[key].splice(index, 1)
  }
}

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
