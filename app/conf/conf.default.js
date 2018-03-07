(function() {
    'use strict';

    // The configuration is written as an Angular service
    angular.module('bib.conf', [])
        .constant('googleAnalyticsId', 'UA-XXXXXXX-XX')
        // will be gulp-replaced with info from /conf/*.toml files
        .constant('backOfficeHost', 'BACK_OFFICE_HOST')
        .constant('backOfficePort', 'BACK_OFFICE_PORT')
})();
