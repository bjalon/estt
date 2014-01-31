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
      .when('/emprunt_resume/:livreRef', {
        templateUrl: 'views/emprunt_resume.html',
        controller: 'EmpruntCtrl'
      })
      .when('/restitution', {
        templateUrl: 'views/restitution.html',
        controller: 'RestitutionCtrl'
      })
      .when('/recherche', {
        templateUrl: 'views/recherche.html',
        controller: 'RechercheCtrl'
      })
      .otherwise({
        redirectTo: '/emprunt'
      });
  });
