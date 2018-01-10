import angular from 'angular'
import ngRoute from 'angular-route'

import appComponent from './components/app'
import filters from './filters'
import session from './services/session'

// redirect to home if not authorized
const checkAuth = {
  checkAuth: [
    '$location',
    '$q',
    'session',
    ($location, $q, session) => {
      if (session.email) return $q.resolve()
      $location.path('/')
      return $q.reject()
    },
  ],
}

angular.module('bobib', [ngRoute, appComponent, filters, session]).config([
  '$locationProvider',
  '$routeProvider',
  ($locationProvider, $routeProvider) => {
    $locationProvider.html5Mode(true)
    $routeProvider
      .when('/', {
        template: '<h1 class="title">Home</h1><p><a href="http://cartosciencepolitique.sciencespo.fr">Front Office</a></p>',
      })
      .when('/centers/:id', {
        template: '<center-form id="$resolve.id" />',
        resolve: {
          id: [
            '$q',
            '$route',
            ($q, { current }) => $q.resolve(current.params.id),
          ],
        },
      })
      .when('/centers', {
        template: '<centers-list />',
      })
      .when('/modifications', {
        template: '<modifications-list />',
        resolve: checkAuth,
      })
      .when('/users/add', {
        template: '<user-form />',
        resolve: checkAuth,
      })
      .when('/users', {
        template: '<users-list />',
        resolve: checkAuth,
      })
      .when('/login', {
        template: '<login-form />',
      })
      .otherwise('/')
  },
])
