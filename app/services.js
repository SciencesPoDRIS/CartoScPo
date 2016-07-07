'use strict';

/* Services */

angular.module('bib.services', [])
  .config(function ( $httpProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .factory('fileService', [ '$http', '$q', function($http, $q) {

   return {

     getFile : function(url) {
       var deferred = $q.defer();
       $http.get(url).success(function(data) {
         deferred.resolve(data);
       }).error(function(){
         deferred.reject('An error occured while fetching file');
       });

       return deferred.promise;
     }
   }
  }])