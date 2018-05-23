import SimpleMDE from 'simplemde'
import angular from 'angular'

export default angular.module('bobib.simplemde', []).directive('simplemde', [
  '$parse',
  function($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      controller: [
        '$scope',
        function($scope) {
          return {
            get: () => $scope.simplemde.instance,
            rerenderPreview: val => $scope.simplemde.rerenderPreview(val),
          }
        },
      ],
      link: function(scope, element, attrs, ngModel) {
        var options, rerenderPreview
        options = $parse(attrs.simplemde)(scope) || {}
        options.element = element[0]
        options.spellChecker = false
        options.toolbar = [
          'bold',
          'italic',
          '|',
          'quote',
          'ordered-list',
          'unordered-list',
          '|',
          'guide',
        ]

        const mde = new SimpleMDE(options)
        mde.codemirror.on('change', () =>
          scope.$applyAsync(() => ngModel.$setViewValue(mde.value())),
        )
        ngModel.$render = () => {
          const val = ngModel.$modelValue || options['default']
          mde.value(val)
          if (mde.isPreviewActive()) {
            rerenderPreview(val)
          }
        }
        rerenderPreview = () => {}
        scope.simplemde = {
          instance: mde,
          rerenderPreview: rerenderPreview,
        }
      },
    }
  },
]).name
