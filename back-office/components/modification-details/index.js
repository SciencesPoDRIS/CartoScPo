import angular from 'angular'
import { createPatch } from 'rfc6902'
import { properties } from '../../schema.json'
import './index.css'

// diffs helper

const getValue = (obj, props) => {
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

const getLabel = key => {
  if (!key) return ''
  if (properties[key]) return (properties[key] || {}).label

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

const computeDiffs = (left, right) => {
  return createPatch(left, right)
    .filter(d => !['/id', '/createdAt', '/updatedAt'].includes(d.path))
    .map(d => {
      // leading slash
      const key = d.path.slice(1)
      return {
        key,
        op: d.op,
        label: getLabel(key),
        left: String(getValue(left, key)),
        right: String(getValue(right, key)),
        // use for add op or remove op
        value: d.value || getValue(left, key),
      }
    })
}

class controller {
  constructor($http) {
    this.modifications = {}
    this.center = {}
    this.diffs = []
    this.$http = $http
  }

  $onInit() {
    this.$http.get(`/api/modifications/${this.id}`).then(({ data }) => {
      this.modification = data.modification
      if (this.modification.verb === 'create') {
        this.diffs = computeDiffs({}, this.modification.submittedCenter)
        return
      }

      // verb update
      this.$http
        .get(`/api/centers/${this.modification.centerId}`)
        .then(({ data }) => {
          this.center = data.center
          // for auto accepted modifs by admin
          if (this.modification.status === 'accepted') {
            this.diffs = computeDiffs(
              this.modification.oldCenter,
              this.modification.submittedCenter,
            )
          } else {
            this.diffs = computeDiffs(
              data.center,
              this.modification.submittedCenter,
            )
          }
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
