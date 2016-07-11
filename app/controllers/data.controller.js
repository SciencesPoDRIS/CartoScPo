'use strict';

/* Controllers */

angular.module('bib.controller.data', [])
  .controller('data', [ '$scope', '$location', "$http", "fileService", "_", "uiGridConstants", "$filter",
    function($scope, $location, $http, fileService, _, uiGridConstants, $filter) {

    var url = '../data/Donnees_centres_de_recherche_SP_2015 - Description administrative.csv'
   
   // get csv from url
   fileService
     .getFile(url)
     .then(function (result) {

      //transform csv to json
      var parsed = Papa.parse(result, {header: true, encoding: "utf-8"});

      // select only five colomns in csv
      var data = []
      _.forEach(parsed.data, function(v, k) {
        var center = {};

        center['Intitulé'] = v['Intitulé'];
        center['Sigle ou acronyme'] = v['Sigle ou acronyme'];
        center['Ville'] = v['Ville'];
        center['Code Unité'] = v['Code Unité'];

        data.push(center);
      })

      $scope.myData = data;
      $scope.gridOptions.data = $scope.myData;
    });

     
      //grid settings
      $scope.gridOptions = {
        enableFiltering: true,
        enableHighlighting: true,
        enableGridMenu: true,
        exporterMenuPdf: false,
        columnDefs: [
          { field: 'Intitulé', enableFiltering: true},
          { field: 'Sigle ou acronyme', enableFiltering: true},
          { field: 'Ville' , enableFiltering: true},
          { field: 'Code Unité' , enableFiltering: true}
        ]
      };

      $scope.filterText;

      $scope.refreshData = function() {
        $scope.gridOptions.data = $filter('filter')($scope.myData, $scope.filterText, undefined);
        console.log("$scope.gridOptions.data", $scope.gridOptions.data);
     };


      // // export data as csv
      // $scope.exportData = function() {
      //   var csv = Papa.unparse($scope.myData),
      //       blob = new Blob([csv], {type: 'attachment/csv;charset=utf-8'}),
      //       dataUrl = URL.createObjectURL(blob);

      //   var a = document.createElement('a');
      //   a.style.display = 'none';
      //   a.setAttribute('href', dataUrl);
      //   document.body.appendChild(a);
      //   a.setAttribute('download', 'data' + '.csv');
      //   a.click();
      //   document.body.removeChild(a);
      // }
  }])