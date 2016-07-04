'use strict';

/* Directives */

angular.module('bib.directive.tab', [])

  .directive('tabs', function() {
      return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: [ "$scope", function($scope) {
          console.log("$scope")
          var panes = $scope.panes = [];
   
          $scope.select = function(pane, title) {
            console.log("title", title)
            console.log("pane", pane);
            angular.forEach(panes, function(pane) {
              pane.selected = false;
            });
            pane.selected = true;
          }
   
          this.addPane = function(pane) {
            if (panes.length == 0) $scope.select(pane);
            panes.push(pane);
          }
        }],
        template:
          '<div class="tabbable">' +
            '<ul class="nav nav-tabs">' +
              '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" class="panesStyle" style="width:300px; text-align:center;">'+
                '<a href="" ng-click="select(pane, title)" style="font-size: 24px;font-weight: bold;">{{pane.title}} </a>' +
              '</li>' +
            '</ul>' + 
            '<div class="tab-content" ng-transclude></div>' +
          '</div>',
        replace: true
      };
    })

  .directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  })

