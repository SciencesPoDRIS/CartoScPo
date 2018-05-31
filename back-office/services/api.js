import angular from 'angular'

function Service($http) {
  const api = function() {}
  // get, post etc...
  Object.keys($http)
    .filter(x => typeof $http[x] === 'function')
    .forEach(method => {
      api[method] = (...args) => {
        // relative path since the BO is served in /bo
        args[0] = `api/${args[0]}`
        // better than .success()
        // https://github.com/angular/angular.js/issues/10508
        return $http[method](...args).then(x => x.data)
      }
    })

  // rare scenario
  api.deleteWithData = (url, data) =>
    $http({
      method: 'DELETE',
      url: `api/${url}`,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    })

  return api
}

Service.$inject = ['$http']

export default angular.module('bobib.api', []).service('api', Service).name
