'use strict';

/* Controllers */

angular.module('bib.controller.data', [])
  .controller('data', [ "$scope", "$location", "$http", "fileService", 
    function($scope, $location, $http, fileService) {

    var url = "../data/Donnees_centres_de_recherche_SP_2015 - Description administrative.csv"
   // get csv from url
   fileService
     .getFile(url)
     .then(function (result) {
      console.log("result", result);
     })

   $scope.myData = [
    {
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
        "employed": true
    },
    {
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
        "employed": false
    },
    {
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
        "employed": false
    }
];

   // setup grid with option

   // export data

  }])