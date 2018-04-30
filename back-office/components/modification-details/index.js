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
  constructor(api, $location, $rootScope) {
    Object.assign(this, { api, $location, $rootScope })

    this.modifications = {}
    this.center = {}
    this.diffs = []
  }

  $onInit() {
    this.api.get(`modifications/${this.id}`).then(({ modification }) => {
      this.modification = modification
      if (this.modification.verb === 'create') {
        this.diffs = computeDiffs({}, this.modification.submittedCenter)
        return
      }
      if (this.modification.verb === 'delete') {
        this.diffs = computeDiffs(this.modification.oldCenter, {})
        return
      }

      // verb update
      this.api
        .get(`centers/${this.modification.centerId}`)
        .then(({ center }) => {
          this.center = center
          // for auto accepted modifs by admin
          if (this.modification.status === 'accepted') {
            this.diffs = computeDiffs(
              this.modification.oldCenter,
              this.modification.submittedCenter,
            )
          } else {
            this.diffs = computeDiffs(
              center,
              this.modification.submittedCenter,
            )
          }
        }, console.error)
    }, console.error)
  }

  changeStatus(status) {
    const redirect = () => {
      this.$rootScope.flashes.push('Modificaton traitée')
      this.$location.path('/modifications')
    }
    this.api
      .patch(`modifications/${this.id}`, { status })
      .then(redirect, console.error)
  }
}
controller.$inject = ['api', '$location', '$rootScope']

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
