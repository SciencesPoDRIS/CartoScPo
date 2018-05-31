import angular from 'angular'
import ngFileUpload from 'ng-file-upload'
import logoMod from '../logo'
import './index.css'

class controller {
  static $inject = [
    '$log',
    '$location',
    '$rootScope',
    'api',
    'session',
    'Upload',
  ]

  constructor($log, $location, $rootScope, api, session, Upload) {
    Object.assign(this, { $log, $location, $rootScope, api, session, Upload })
  }

  $onInit() {
    if (this.id) {
      // edit
      this.loading = true
      this.api
        .get(`centers/${this.id}`)
        .then(({ center }) => {
          this.center = center
        })
        .catch(this.$log.error)
        .then(() => (this.loading = false))
    }
  }

  uploadLogo(file) {
    file.upload = this.Upload.upload({
      url: `api/upload-logo/${this.id}`,
      data: { file, centerId: this.id },
    })

    file.upload.then(
      () => {
        this.$rootScope.flashes.push('Logo transmis')
        this.$location.path('/centers')
      },
      this.$log.error,
      evt =>
        (file.progress = Math.min(
          100,
          parseInt((100.0 * evt.loaded) / evt.total),
        )),
    )
  }
}

const component = {
  template: require('./index.html'),
  controller,
  bindings: {
    id: '=?',
  },
}

export default angular
  .module('bobib.logo-form', [ngFileUpload, logoMod])
  .component('logoForm', component).name
