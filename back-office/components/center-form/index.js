import angular from 'angular'
import logoMod from '../logo'
import { properties } from '../../schema.json'

class controller {
  constructor($http, $location, $rootScope) {
    this.$http = $http
    this.$location = $location
    this.$rootScope = $rootScope

    this.center = {}
    this.tab = 'administration'
    this.tabs = [
      { id: 'administration', label: 'Description' },
      { id: 'schools', label: 'Écoles doctorales' },
      { id: 'research', label: 'Thématiques' },
      { id: 'publications', label: 'Publications' },
      { id: 'resources', label: 'Documentation' },
    ]
    this.fields = Object.keys(properties).map(key => {
      properties[key].key = key
      return properties[key]
    })
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
      .put(`/api/centers/${this.id}`, { center: this.center })
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
controller.$inject = ['$http', '$location', '$rootScope']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=',
  },
}

export default angular
  .module('bobib.center-form', [logoMod])
  .component('centerForm', component).name
