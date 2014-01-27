'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('EleveCtrl', function ($scope, $http, $location) {
        
    	$scope.fetchEleve = function() {
    	  var username = $scope.username;
    	  alert("change: " + username);

    	  $http({method: 'GET', url: '/nuxeo/site/front/eleve/' + username}).
			success(function(data, status, headers, config) {
			    $scope.eleve = data;
			    $scope.eleveId = $scope.eleve['ecm:uuid'];
			    $scope.photoURL = '/nuxeo/nxfile/default/' + $scope.eleveId + '/userprofile:avatar/test' + $scope.eleve['file:filename'];
		  }).
		  error(function(data, status, headers, config) {
			    $scope.eleve = null;
			    $scope.eleveId = null;
			    $scope.photoURL = null;
		  });
    	} 
    	$scope.info = function() {
    	  alert("Test : " + $scope.username);
    	  $scope.fetchEleve($scope.username);
    	}
    }); 

