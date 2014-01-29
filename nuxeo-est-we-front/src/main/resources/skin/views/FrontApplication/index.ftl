<!DOCTYPE html>
<html ng-app='nuxeoBibliothequeFrontApp'>
<head>
	<title>Ecole Sainte Thérèse - Bibliothèque</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>

    <link rel="stylesheet" href="${skinPath}/bower_components/select2/select2.css">
	<link rel="stylesheet" href="${skinPath}/bower_components/bootstrap/dist/css/bootstrap.min.css">

	<script type="text/javascript" src="]bower_components/jquery/jquery.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/select2/select2.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/angular/angular.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/angular-ui-select2/src/select2.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/bootstrap/dist/js/bootstrap.js"></script>

	<script src="${skinPath}/js/app/app.js"></script>
	<script src="${skinPath}/js/app/controllers/emprunt.js"></script>
	<script src="${skinPath}/js/app/controllers/restitution.js"></script>
	<script src="${skinPath}/js/app/controllers/recherche.js"></script>

	<script src="${skinPath}/js/app/controllers/eleve.js"></script>
	<script src="${skinPath}/js/app/controllers/livre.js"></script>

</head>
<body >

  <div class="navbar navbar-inverse navbar-static-top" ng-controller="NavigationCtrl">
  	<div class="container">
      <button class="navbar-toggle" data-toggle="collapse" data-target=".navbarHeader">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
  	  <a class="navbar-brand" src="#">Bibliothèque</a>
      <div class="collapse navbar-collapse navbarHeader">
        <ul class="nav navbar-nav navbar-right">
          <li ng-class="{active : currentView = 'emprunt'}" >
            <a href="./emprunt">Emprunt</a>
          </li>
          <li ng-class="{active : currentView = 'restitution'}">
            <a href="./restitution">Restitution</a>
          </li>
          <li ng-class="{active : currentView = 'rechercher'}">
            <a href="./rechercher">Rechercher</a>
          </li>
        </ul>
      </div>
  	</div>

  </div>


  <div class="container" ng-view>
  </div>


  <div class="navbar navbar-inverse navbar-static-bottom">
  	<div class="container">
  	  Picture by <a href="http://www.flickr.com/photos/mikejsolutions/2444102219">mikejsolutions</a> / CC BY
  	</div>
  </div>
</body>
</html>
