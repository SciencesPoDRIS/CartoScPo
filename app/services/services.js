'use strict';

/* Services */

angular.module('bib.services', [])
  .config(function ( $httpProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .factory('fileService', [ '$http', '$q', function($http, $q) {

   return {

     getFile : function(file) {
       var deferred = $q.defer();
       $http({
        method: 'GET',
        url: file,
        headers : {
                "Pragma": "no-cache",
                "Expires": -1,
                "Cache-Control": "no-cache"
        },
        cache: false
      })
      .success(function(data) {
         deferred.resolve(data);
       }).error(function(){
         deferred.reject('An error occured while fetching file');
       });

       return deferred.promise;
     }
   }
  }])