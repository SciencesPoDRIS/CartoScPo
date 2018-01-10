import angular from 'angular'
import logoMod from '../logo'
import fieldsListMod from '../fields-list'
import { properties } from '../../schema.json'
import './index.css'

class controller {
  constructor($http, $location, $rootScope, session) {
    Object.assign(this, { $http, $location, $rootScope, session })

    this.center = {}
    this.tab = 'administration'
    this.tabs = [
      { id: 'administration', label: 'Description' },
      { id: 'schools', label: 'Écoles doctorales' },
      { id: 'research', label: 'Thématiques' },
      { id: 'publications', label: 'Publications' },
      { id: 'resources', label: 'Documentation' },
    ]

    const getFields = properties =>
      Object.keys(properties)
        .map(key => {
          properties[key].key = key
          if (properties[key].type === 'array' || properties[key].type === 'boolean-item') {
            properties[key].fields = getFields(properties[key].item)
          }
          return properties[key]
        })
        // to hide a form field in the back office, set "bo": false in schema.json
        .filter(field => field.bo !== false)
        // TODO remove these warts after ultimate populate-db
        .map(field => {
          // temp for `nom`
          if (field.tab === 'personnel') field.tab = 'administration'
          return field
        })

    this.fieldsByTab = getFields(properties).reduce((acc, field) => {
      acc[field.tab] = [...(acc[field.tab] || []), field]
      return acc
    }, {})

    // optionally provided by guest user
    this.email = ''
  }

  $onInit() {
    this.loading = true
    this.$http
      .get(`/api/centers/${this.id}`)
      .then(({ data }) => {
        this.center = data.center
        this.sections = Object.keys(data.center).filter(s => s != 'id')
      })
      .catch(console.error)
      .then(() => (this.loading = false))
  }

  isActive(tab) {
    return tab.id === this.tab
  }

  setTab(tab) {
    this.tab = tab.id
  }

  submit() {
    const redirect = () => {
      this.$rootScope.flashes.push('Centre sauvegardé')
      this.$location.path('/centers')
    }
    this.$http
      .put(`/api/centers/${this.id}`, {
        center: this.center,
        email: this.email,
      })
      .then(redirect, console.error)
  }

  // to fill textareas
  splitBy(char, value) {
    if (!value) return ''
    return value
      .split(char)
      .map(v => v.trim())
      .filter(v => v)
      .join('\n')
  }
}
controller.$inject = ['$http', '$location', '$rootScope', 'session']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=',
  },
}

export default angular
  .module('bobib.center-form', [logoMod, fieldsListMod])
  .component('centerForm', component).name
