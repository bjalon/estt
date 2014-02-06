'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('EmpruntCtrl', function ($routeParams, $scope, $http, $location) {
    
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

	    $scope.select2eleveSetup = {
	       minimumInputLength: 1,
	       query: function (query) {
	         var username = query.term, i;
	
	         $http({method: 'GET', url: '/nuxeo/site/front/search/eleve/' + username}).
	            success(function(eleves, status, headers, config) {
	               // TODO : Check if array
	               var index;
	               var data = {results: []};
	               for (index = 0; index < eleves.length; ++index) {
	                 data.results.push({ id: eleves[index]['value'], text: eleves[index]['text'] });
	                 query.callback(data);
	               }
	         }).
	         error(function(data, status, headers, config) {
	                $scope.eleve = null;
	         });
	       }
	    }

    	$scope.params = $routeParams;
    	$scope.livreRef = $scope.params.livreRef;
    	
    	if ($scope.livreRef) {
    	  $scope.fetchLivre();
    	}
    	
    	$scope.reset = function() {
    	  $scope.eleve = null;
    	  $scope.invalidLivre();
    	  $scope.username = null;
    	  $scope.livreRef = null;
    	}
    	
    	$scope.emprunter = function() {
    	  alert("emprunter");
    	  $location.path('/emprunt_resume/' + $scope.livreRef);
    	}

    }); 

