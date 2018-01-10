import angular from 'angular'
import commonmark from 'commonmark'

export default angular
  .module('commonmark', [])
  .provider('commonMark', function() {
    var defaultOptions = {
      sanitize: false,
      highlight: false,
    }

    this.setOptions = function(opt) {
      defaultOptions = angular.extend(defaultOptions, opt || {})
    }

    this.$get = [
      '$injector',
      '$log',
      function($injector, $log) {
        var commonMark = function commonMark(md, opt) {
          opt = angular.extend({}, defaultOptions, opt || {})

          var parsed = commonMark.parser.parse(md)
          var htmlRenderer = commonMark.renderer

          if (opt.highlight && typeof opt.highlight === 'function') {
            var walker = parsed.walker(),
              event,
              block

            while ((event = walker.next())) {
              block = event.node
              if (block.type === 'CodeBlock') {
                var info_words = block.info.split(/ +/)
                var attr =
                  info_words.length === 0 || info_words[0].length === 0
                    ? ''
                    : 'class=language-' +
                      htmlRenderer.escape(info_words[0], true)

                block.literal =
                  '<pre><code ' +
                  attr +
                  '>' +
                  opt.highlight(block.literal) +
                  '</pre></code>'
                block._type = 'HtmlBlock'
              }
            }
          }

          var html = htmlRenderer.render(parsed)

          if (opt.sanitize !== false) {
            if ($injector.has('$sanitize')) {
              var $sanitize = $injector.get('$sanitize')
              html = $sanitize(html)
            } else {
              $log.error(
                'angular-commonmark:',
                "Add 'ngSanitize' to your module dependencies",
              )
              html = ''
            }
          }

          return html
        }

        commonMark.renderer = new commonmark.HtmlRenderer()
        commonMark.parser = new commonmark.Parser()

        return commonMark
      },
    ]
  })

  .directive('commonMark', [
    'commonMark',
    commonMark => ({
      restrict: 'AE',
      replace: true,
      scope: {
        opts: '=',
        commonMark: '=',
      },
      link: (scope, element, attrs) => {
        set(scope.commonMark || element.text() || '')

        function set(val) {
          element.html(commonMark(val || '', scope.opts || null))
        }

        if (attrs.commonMark) {
          scope.$watch('commonMark', set)
        }
      },
    }),
  ]).name
