'use strict';

angular.module('bib.services')
.factory('centerService', function (dataService) {
  return {
    // retrieve info from data.json
    getAll: function () {
      return dataService.get().then(function (data) {
        return data.centers
      });
    }
  };
});

