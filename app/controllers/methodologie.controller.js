'use strict';

/* Controllers */

angular.module('bib.controller.methodologie', [])
  .controller('methodologie', [ '$scope', '$location', "$http", "fileService", "_",
    function($scope, $location, $http, fileService, _) {
    	localStorage.setItem("loadingPage",false);
    	var url = './data/methodologie.json'
    }
]);