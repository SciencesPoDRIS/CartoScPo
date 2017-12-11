/* globals Papa */
'use strict';

angular.module('bib.controllers')
    .controller('data', ['$scope', '$location', '$http', 'fileService', 'uiGridConstants', '$filter',
        function($scope, $location, $http, fileService, uiGridConstants, $filter) {
            var url = './data/data.json';
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
                    { field: 'Intitulé', enableFiltering: true },
                    { field: 'Sigle ou acronyme', enableFiltering: true },
                    { field: 'Ville', enableFiltering: true },
                    { field: 'Code Unité', enableFiltering: true }
                ]
            };

            $scope.filterText;
            // full text search -> see app.js for the filter
            $scope.refreshData = function() {
                $scope.gridOptions.data = $filter('filter')($scope.myData, $scope.filterText, undefined);
            };

            // // export data as csv
            $scope.exportData = function() {

                var dataSelected = [];
                _.forEach($scope.gridApi.grid.renderContainers.body.visibleRowCache, function(d) {
                    delete d.entity['addressesGeo'];
                    delete d.entity['$$hashKey'];
                    delete d.entity['Commentaires'];
                    delete d.entity['Logo'];
                    dataSelected.push(d.entity);
                });

                var csv = Papa.unparse(dataSelected),
                    blob = new Blob([csv], { type: 'attachment/csv;charset=utf-8' }),
                    dataUrl = URL.createObjectURL(blob);

                var a = document.createElement('a');
                a.style.display = 'none';
                a.setAttribute('href', dataUrl);
                document.body.appendChild(a);
                a.setAttribute('download', 'data' + '.csv');
                a.click();
                document.body.removeChild(a);
            };

            $scope.resetSearch = function() {
                $scope.filterText = '';
                $scope.gridOptions.data = $filter('filter')($scope.myData, $scope.filterText, undefined);
            };

            fileService
                .getFile(url)
                .then(function(result) {

                    // select only five colomns in csv
                    var data = [],
                        headers = [];
                    _.forEach(result.allCenters, function(tab) {
                        var center = {};
                        _.forEach(tab, function(onglet) {
                            _.forEach(onglet, function(content, prop) {
                                  center[prop] = content;
                                  headers.push({ field: prop, enableFiltering: true });
                            });
                        });
                        data.push(center);
                    });

                    $scope.myData = data;
                    $scope.gridOptions.data = $scope.myData;
                });
        }
    ]);
