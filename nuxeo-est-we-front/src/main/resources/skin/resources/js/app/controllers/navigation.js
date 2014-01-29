'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('NavigationCtrl', function ($scope, $location) {
    
      alert($location);
      alert($location.path);
    
      if ($location.path.contains('emprunt')) {
        $scope.currentView = 'emprunt';
      } 
      if ($location.path.contains('restitution')) {
        $scope.currentView = 'restitution';
      } 
      if ($location.path.contains('chercher')) {
        $scope.currentView = 'chercher';
      } 
    
    });
