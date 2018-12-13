(function() {
  'use strict';

  // The configuration is written as an Angular service
  angular
    .module('bib.conf', [])
    // will be gulp-replaced with info from /conf/*.toml files
    .constant('googleAnalyticsId', 'GOOGLE_ANALYTICS_ID')
    .constant('backOfficeBaseUrl', 'BACK_OFFICE_BASEURL');
})();
