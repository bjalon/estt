<@extends src="base.ftl">

<@block name="stylesheets">
</@block>
<@block name="header_scripts">
	<script src="${skinPath}/js/app/controllers/eleve.js"></script>
	<script src="${skinPath}/js/app/controllers/livre.js"></script>
</@block>


<@block name="content">

    <form class="form-horizontal">
        <!-- **************************** LIVRE ***************************** -->
      	<div class="row" style="padding-top: 20px" ng-controller="LivreCtrl">
      		<div class="col-sm-4 panel panel-default">
    	  	  	<div class="form-group panel-body">
                    <center style="padding: 10px;">
                        <img height="100px" class="eleve" src="${skinPath}/img/livre.png" alt="eleve">
                    </center>
          	  		  <input ng-change="fetchLivre()" type="text" class="form-control" ng-model="livreRef"
          	  		    id="livre-name" placeholder="Identifiant du Livre - exemple : 100-001">
    	  		</div>
            </div>
      	    <div ng-hide="livreId == null" class="col-sm-3">
                <center>
      		        <img height="150px" class="jaquette" ng-src="{{jaquetteURL}}" alt="jaquette">
                </center>
    	    </div>
            <div ng-hide="livreId == null" class="col-sm-5">
              <div class="">
                <label for="bookTitle">Titre</label>
                <div id="bookTitle">{{livre['dc:title']}}</div>
              </div>
              <div class="">
                <label for="bookDescription">Description</label>
                <div id ="bookDescription">{{description}}</div>
              </div>
              
            </div>
      	</div>

        <!-- **************************** ELEVE ***************************** -->
        <div class="row" style="padding-top: 20px" ng-controller="EleveCtrl">
            <div class="col-sm-4 panel panel-default">
                <div class="form-group panel-body">
                    <center style="padding: 10px;">
                        <img height="100px" class="eleve" src="${skinPath}/img/emprunteur.png" alt="eleve">
                    </center>
                    <!-- ng-change="fetchEleve()"  -->
                    <!--<input type="hidden" style="width: 100%;" id="eleveIdentifiant" ng-model="username">-->
                    <select ui-select2 id="eleveIdentifiant" style="width: 100%;" ng-model="username" 
                      placeholder="Nom de l'emprunteur - ex : Juliette JALON ou Classe 3">
                        <option value=""></option>
                        <option value="morveillon">Monique Orveillon</option>
                        <option value="mjalon">Monique Jalon</option>
                        <option value="jjalon">Juliette Jalon</option>
                        <option value="Administrator">Benjamin JALON</option>
                    </select>
                    <button ng-click="info()" class="btn">Test</button>
                </div>
            </div>
            <div ng-hide="eleveId == null" class="col-sm-3">
                <center>
                    <img height="150px" class="eleve" ng-src="{{photoURL}}" alt="eleve">
                </center>
            </div>
            <div ng-hide="eleveId == null" class="col-sm-5">
              <label>Prénom</label>
              <div>{{eleve['firstName']}}</div>
              <label>Nom</label>
              <div>{{eleve['lastName']}}</div>
            </div>
        </div>
      </form>

</@block>
</@extends>
