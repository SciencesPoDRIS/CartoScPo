import angular from 'angular'
import ngRoute from 'angular-route'

import appComponent from './components/app'

angular.module('bobib', [ngRoute, appComponent]).config([
  '$locationProvider',
  '$routeProvider',
  ($locationProvider, $routeProvider) => {
    $locationProvider.html5Mode(true)
    $routeProvider
      .when('/', {
        template: '<h1 class="title">Home</h1>',
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
      })
      .when('/users', {
        template: '<h1 class="title">Users</h1>',
      })
      .otherwise('/')
  },
])
