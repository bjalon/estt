'use strict';

angular.module('nuxeoBibliothequeFrontApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ui.select2'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'EmprunterCtrl'
            })
            .when('/restituer', {
                templateUrl: 'views/restituer.html',
                controller: 'RestituerCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

    });

