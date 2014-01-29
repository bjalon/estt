'use strict';

angular.module('nuxeoBibliothequeFrontApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.select2'
]).config(function ($routeProvider) {
    $routeProvider
      .when('/emprunt', {
        templateUrl: 'views/emprunt.html',
        controller: 'EmpruntCtrl'
      })
      .when('/restitution', {
        templateUrl: 'views/restitution.html',
        controller: 'EmpruntCtrl'
      })
      .when('/recherche', {
        templateUrl: 'views/recherche.html',
        controller: 'EmpruntCtrl'
      })
      .otherwise({
        redirectTo: '/emprunt'
      });
  });
