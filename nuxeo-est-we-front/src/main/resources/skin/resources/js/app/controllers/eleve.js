'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('EleveCtrl', function ($scope, $http, $location) {
        
    	$scope.fetchEleve = function() {
    	  var username = $scope.username;

    	  $http({method: 'GET', url: '/nuxeo/site/front/eleve/' + username}).
			success(function(data, status, headers, config) {
			    $scope.eleve = data;
			    $scope.eleve.photoURL = '/nuxeo/nxfile/default/' + $scope.eleve['ecm:uuid'] + '/userprofile:avatar/test' + $scope.eleve['file:filename'];
		  }).
		  error(function(data, status, headers, config) {
			    $scope.eleve = null;
		  });
    	} 
    }); 

