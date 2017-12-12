import angular from 'angular'
import logoMod from '../logo'

class controller {
  constructor($http, $location) {
    this.$http = $http
    this.$location = $location

    this.center = {}
    this.tab = 'administration'
    this.tabs = [
      { id: 'administration', label: 'Description' },
      { id: 'ecole', label: 'Écoles doctorales' },
      { id: 'recherche', label: 'Thématiques' },
      { id: 'publications', label: 'Publications' },
      { id: 'ressources', label: 'Documentation' },
    ]
  }

  $onInit() {
    this.$http
      .get(`/api/centers/${this.id}`)
      .then(({ data }) => {
        this.center = data.center
        this.sections = Object.keys(data.center).filter(s => s != 'id')
      })
      .catch(console.error)
  }

  isActive(tab) {
    return tab.id === this.tab
  }

  setTab(tab) {
    this.tab = tab.id
  }

  submit() {
    const redirect = () => this.$location.path('/centers')
    this.$http
      .put(`/api/centers/${this.id}`, { center: this.center })
      .then(redirect, console.error)
  }
}
controller.$inject = ['$http', '$location']

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
