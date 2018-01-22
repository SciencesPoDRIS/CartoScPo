import angular from 'angular'
import { properties } from '../../schema.json'
import './index.css'

class controller {
  constructor($http) {
    this.modifications = {}
    this.center = {}
    this.diffs = []
    this.$http = $http
  }

  $onInit() {
    const computeDiff = (left, right) => {
      this.diffs = Object.keys(left)
        .map(key => ({
          key,
          label: (properties[key] || {}).label,
          left: left[key],
          right: right[key],
        }))
        .filter(pairs => pairs.left !== pairs.right)
        // TODO deep
        .filter(pairs => typeof pairs.left === 'string')
    }
    this.$http.get(`/api/modifications/${this.id}`).then(({ data }) => {
      this.modification = data.modification
      this.$http
        .get(`/api/centers/${this.modification.centerId}`)
        .then(({ data }) => {
          this.center = data.center
          computeDiff(data.center, this.modification.center)
        }, console.error)
    }, console.error)
  }
}
controller.$inject = ['$http']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=',
  },
}

export default angular
  .module('bobib.modification-details', [])
  .component('modificationDetails', component).name
