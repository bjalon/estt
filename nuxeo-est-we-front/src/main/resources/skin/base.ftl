<!DOCTYPE html>
<html ng-app='nuxeoBibliothequeFrontApp'>
<head>
	<title>Ecole Sainte Thérèse - Bibliothèque</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>

    <link rel="stylesheet" href="${skinPath}/bower_components/select2/select2.css">
	<link rel="stylesheet" href="${skinPath}/bower_components/bootstrap/dist/css/bootstrap.min.css">

	<script type="text/javascript" src="${skinPath}/bower_components/jquery/jquery.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/select2/select2.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/angular/angular.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/angular-ui-select2/src/select2.js"></script>
	<script type="text/javascript" src="${skinPath}/bower_components/bootstrap/dist/js/bootstrap.js"></script>

	<script src="${skinPath}/js/app/app.js"></script>

    <@block name="stylesheets" />
    <@block name="header_scripts" />
	
	<script>
        $(document).ready(
        	function() { 
        	  $("#eleveIdentifiant").select2();
//        	  $("#eleveIdentifiant").select2({tags:["test1", "test2"]});
//        	  $("#eleveIdentifiant").on("change", function(e) {
//        	    eval($("#eleveIdentifiant").attr("ng-change"));
//        	  })
        });
    </script> 


</head>
<body >

  <div class="navbar navbar-inverse navbar-static-top">
  	<div class="container">
      <button class="navbar-toggle" data-toggle="collapse" data-target=".navbarHeader">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
  	  <a class="navbar-brand" src="#">Bibliothèque</a>
      <div class="collapse navbar-collapse navbarHeader">
        <ul class="nav navbar-nav navbar-right">
          <li class="active">
            <a href="./emprunt">Emprunt</a>
          </li>
          <li class="">
            <a href="./restitution">Restitution</a>
          </li>
          <li class="">
            <a href="./rechercher">Rechercher</a>
          </li>
        </ul>
      </div>
  	</div>

  </div>


  <div class="container">
<@block name="content" />
  </div>


  <div class="navbar navbar-inverse navbar-static-bottom">
  	<div class="container">
  	  Picture by <a href="http://www.flickr.com/photos/mikejsolutions/2444102219">mikejsolutions</a> / CC BY
  	</div>
  </div>
</body>
</html>
