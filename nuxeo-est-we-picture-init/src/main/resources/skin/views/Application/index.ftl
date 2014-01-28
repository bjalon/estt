<@extends src="base.ftl">

<@block name="content">

<div class="container">
	<p class="lead">
	  Sélectionner la photo pour le Livre <b>${Document.title}</b>
	</p>
	<div class="row-fluid">
	<form class="form" action="${Root.path}/nxid/${Document.id}/@file" method="POST" enctype="multipart/form-data">
	  <div class="row">
	    <div class="span4">
	    Choisir Photo
	    </div>
	    <div class="span8">
	     <input type="file" name="file:content">
	    </div>
	  </div>
	  <span>
	    <button class="btn" type="submit">Valider</button>
	  </span>
	  </div>
	</form>
</div>
</@block>
</@extends>
