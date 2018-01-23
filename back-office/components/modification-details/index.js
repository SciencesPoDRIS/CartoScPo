import angular from 'angular'
import { createPatch } from 'rfc6902'
import { properties } from '../../schema.json'
import './index.css'

function getValue(obj, props) {
  props = props.split('/')
  let prop
  while ((prop = props.shift())) {
    obj = obj[prop]
    if (!obj) {
      return obj
    }
  }
  return obj
}

function getLabel(key) {
  if (properties[key]) return properties[key].label

  // nested: example addresses/2/city
  const [first, index, second] = key.split('/')

  // add op
  if (index === '-') return `${properties[first].label}`

  // remove op
  if (!second) return `${properties[first].label} ${index}`

  // replace op
  return `${properties[first].label} ${index} ${
    properties[first].item[second].label
  }`
}

class controller {
  constructor($http) {
    this.modifications = {}
    this.center = {}
    this.diffs = []
    this.$http = $http
  }

  $onInit() {
    const computeDiff = (left, right) => {
      this.diffs = createPatch(left, right)
        .filter(d => !['/id', '/createdAt', '/updatedAt'].includes(d.path))
        .map(d => {
          // leading slash
          const key = d.path.slice(1)
          return {
            key,
            op: d.op,
            label: getLabel(key),
            left: getValue(left, key),
            right: getValue(right, key),
            // use for add op or remove op
            value: d.value || getValue(left, key),
          }
        })
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

  changeStatus(status) {
    this.$http.patch(`/api/modifications/${this.id}`, { status })
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
