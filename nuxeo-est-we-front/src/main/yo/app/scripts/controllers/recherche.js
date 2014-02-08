'use strict';

angular.module('nuxeoBibliothequeFrontApp')
    .controller('RechercheCtrl', function ($scope, $http, $location) {

    $scope.rechercher = function() {
      var postData = { text : 'long blob of text' } ;
      var config = {params : { id: ' 5 ' } } ;
      
	  Shttp.post ('/nuxeo/site/front/search/livre', postData, config).success(function(data, status, headers, config) {
	    // Do something successful
      } ).error (function (data, status, headers, config) {
		// Handle the error
	  })
    }
}); 

