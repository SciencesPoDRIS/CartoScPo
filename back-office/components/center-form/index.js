import angular from 'angular'
import logoMod from '../logo'
import fieldsListMod from '../fields-list'
import { properties } from '../../schema.json'
import './index.css'

class controller {
  constructor(api, $location, $rootScope, session) {
    Object.assign(this, { api, $location, $rootScope, session })

    this.center = {}
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
          if (
            properties[key].type === 'array' ||
            properties[key].type === 'boolean-item'
          ) {
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
    // default if not received via router
    if (!this.tab) this.tab = 'administration'

    if (this.id) {
      // edit
      this.loading = true
      this.api
        .get(`centers/${this.id}`)
        .then(({ center }) => {
          this.center = center
          this.sections = Object.keys(center).filter(s => s != 'id')
        })
        .catch(console.error)
        .then(() => (this.loading = false))
    } else {
      // new
      this.center = {}
    }
  }

  isActive(tab) {
    return tab.id === this.tab
  }

  setTab(tab) {
    this.tab = tab.id
    if (this.id) this.$location.path(`/centers/${this.id}/${tab.id}`, false)
    else this.$location.path(`/centers/add/${tab.id}`, false)
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

  errorCount(form) {
    return Object.keys(form.$error).reduce(
      (acc, key) => acc + form.$error[key].length,
      0,
    )
  }

  // admin or guest who has provided its email
  isUserKnown() {
    return this.session.email || this.email
  }

  submit(form) {
    if (form.$invalid || form.$pristine) return
    if (!this.isUserKnown()) return
    let op
    if (this.id) {
      // edit
      op = this.api
        .put(`centers/${this.id}`, {
          center: this.center,
          email: this.email,
        })
    } else {
      // TODO
      if (!this.center.code) return
      this.center.id = this.center.code.replace(' ', '').toLowerCase()

      // new
      op = this.api
        .post(`centers`, {
          center: this.center,
          email: this.email,
        })
    }
    op.then(() => this.redirect('sauvegardé'), console.error)
  }

  delete() {
    if (!this.isUserKnown()) return

    if (window.confirm(`Êtes vous sur de supprimer ${this.center.code} ?`)) {
      this.api
        .deleteWithData(`centers/${this.center.id}`, { email: this.email })
        .then(() => this.redirect('supprimé'), console.error)
    }
  }

  redirect(action) {
    this.$rootScope.flashes.push(
      this.session.email ? `Centre ${action}` : 'Proposition enregistrée',
    )
    this.$location.path('/centers')
  }
}

controller.$inject = ['api', '$location', '$rootScope', 'session']

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=?',
    tab: '=',
  },
}

export default angular
  .module('bobib.center-form', [logoMod, fieldsListMod])
  .component('centerForm', component).name
