'use strict';

angular.module('bib.components')
    .component('centerList', {
        templateUrl: 'views/center-list.html',
        bindings: {
            centers: '<',
            // expanded details
            expandedCenters: '='
        },
        controller: function($scope) {
            this.toogleCenter = function(centerId) {
                if(this.expandedCenters.indexOf(centerId) !== -1) {
                    this.expandedCenters.splice(this.expandedCenters.indexOf(centerId), 1);
                } else {
                    this.expandedCenters.push(centerId);
                }
            }
        }
    });