'use strict';

angular.module('bib.controllers')
    .controller('project', function($scope) {
            $scope.scrollTo = function(elementId) {
                $.scrollTo($('#' + elementId).offset().top - 120);
            };
        }
);
