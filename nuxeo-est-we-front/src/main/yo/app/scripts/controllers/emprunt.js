'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('EmpruntCtrl', function ($scope, $http, $location) {

        var idSize = 3;

        $scope.isIdLivreValide = function () {
            if ($scope.livreRef) {
                return $scope.livreRef.length == idSize;
            }
            return false;
        }
        
    	$scope.fetchLivre = function() {
    	  if (!$scope.isIdLivreValide()) {
    	    $scope.invalidLivre();
    	    return;
    	  } 

    	  $http({method: 'GET', url: '/nuxeo/site/front/livre/' + $scope.livreRef}).
			success(function(data, status, headers, config) {
			    $scope.livre = data;
			    $scope.livre.jaquetteURL = '/nuxeo/nxfile/default/' + $scope.livre['ecm:uuid'] + '/blobholder:0/' + $scope.livre['file:filename'];
		  }).
		  error(function(data, status, headers, config) {
		    $scope.invalidLivre();
		  });
    	}
    	
    	$scope.invalidLivre = function() {
			    $scope.livre = null;
    	}
        
    	$scope.fetchEleve = function() {
    	  var username = $scope.username;

    	  $http({method: 'GET', url: '/nuxeo/site/front/eleve/' + username}).
			success(function(data, status, headers, config) {
			    $scope.eleve = data;
		  }).
		  error(function(data, status, headers, config) {
			    $scope.eleve = null;
		  });
    	} 
    }); 

