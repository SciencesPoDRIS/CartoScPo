'use strict';

/* Controllers */

angular.module('bib.controller.data', [])
  .controller('data', [ '$scope', '$location', "$http", "fileService", "_", "uiGridConstants", "$filter",
    function($scope, $location, $http, fileService, _, uiGridConstants, $filter) {

    //var url = '../data/Donnees_centres_de_recherche_SP_2015 - Description administrative.csv'
   
   var url = '../data/data.json'
   // get csv from url
    

    //grid settings
    $scope.gridOptions = {
      enableFiltering: true,
      // enableHighlighting: true,
      // enableGridMenu: true,
      // exporterMenuPdf: false,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      },
      columnDefs: [
        { field: 'Intitulé', enableFiltering: true},
        { field: 'Sigle ou acronyme', enableFiltering: true},
        { field: 'Ville' , enableFiltering: true},
        { field: 'Code Unité' , enableFiltering: true}
      ]
    };

    $scope.filterText;
    // full text search -> see app.js for the filter
    $scope.refreshData = function() {
      $scope.gridOptions.data = $filter('filter')($scope.myData, $scope.filterText, undefined);
      console.log("$scope.gridOptions.data", $scope.gridOptions.data);
      console.log("$scope.gridApi", $scope.gridApi.selection.selectAllVisibleRows());
   };

    // // export data as csv
    $scope.exportData = function() {
     
      console.log(" re", $scope.gridApi.grid.renderContainers.body.visibleRowCache);
      var dataSelected = []
       _.forEach($scope.gridApi.grid.renderContainers.body.visibleRowCache, function(d) {
          delete d.entity["id"];
          delete d.entity["adressesGeo"];
          delete d.entity["theme"];
          delete d.entity["$$hashKey"];
          delete d.entity["Commentaires"];
          delete d.entity["Logo"];
          dataSelected.push(d.entity);
       })

       console.log("dataSelected", dataSelected);


      var csv = Papa.unparse(dataSelected),
          blob = new Blob([csv], {type: 'attachment/csv;charset=utf-8'}),
          dataUrl = URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.style.display = 'none';
      a.setAttribute('href', dataUrl);
      document.body.appendChild(a);
      a.setAttribute('download', 'data' + '.csv');
      a.click();
      document.body.removeChild(a);
    }

    fileService
     .getFile(url)
     .then(function (result) {

      //transform csv to json
      //var parsed = Papa.parse(result, {header: true, encoding: "utf-8"});

      // select only five colomns in csv
      var data = [],
          headers = [];
      _.forEach(result.allCenters, function(tab, k) {
        var center = {};
        _.forEach(tab, function(onglet, k) {
          _.forEach(onglet, function(content, prop) {
            if (prop !== "theme" && prop !== "id") {
              center[prop] = content;
              headers.push({field: prop, enableFiltering: true});
            }
          });
        });
        data.push(center);
      });

      console.log(data)
      $scope.myData = data;
      $scope.gridOptions.data = $scope.myData;
    });
}])