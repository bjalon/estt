<!DOCTYPE html>
<html>
<head>

  <title>
     <@block name="title">
     Ecole Sainte Thérèse - Le Mans - Import Photo Couverture
     </@block>
  </title>
  <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="initial-scale=1.0, width=device-width" />

  <link rel="stylesheet" href="${skinPath}/css/bootstrap.css">
  <link rel="stylesheet" href="${skinPath}/css/bootstrap-responsive.css">
  <link rel="stylesheet" href="${skinPath}/css/site.css">
  <link rel="shortcut icon" href="${skinPath}/img/est-favicon.png" />
  <@block name="stylesheets" />
  <@block name="header_scripts" />
 
</head>
 
<body>

<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
      </button>
      <a class="brand" href="${Root.path}">Initialisation Livre - Photo</a>
          <div class="nav-collapse collapse">
            <ul class="nav">
              <li>
                <a href="/nuxeo/nxpath/default/default-domain@view_documents">Liste Livres</a>
              </li>
            </ul>
          </div>
    </div>
  </div>
</div>

<div class="container">
<@block name="content">The Content</@block></td>
</div>

<div class="footer">
    <p>Ecole Sainte Thérèse - Le Mans</p>
</div>


  <script src="${skinPath}/js/third/jquery.js"></script>
  <script src="${skinPath}/js/third/bootstrap-transition.js"></script>
  <script src="${skinPath}/js/third/bootstrap-alert.js"></script>
  <script src="${skinPath}/js/third/bootstrap-modal.js"></script>
  <script src="${skinPath}/js/third/bootstrap-dropdown.js"></script>
  <script src="${skinPath}/js/third/bootstrap-scrollspy.js"></script>
  <script src="${skinPath}/js/third/bootstrap-tab.js"></script>
  <script src="${skinPath}/js/third/bootstrap-tooltip.js"></script>
  <script src="${skinPath}/js/third/bootstrap-popover.js"></script>
  <script src="${skinPath}/js/third/bootstrap-button.js"></script>
  <script src="${skinPath}/js/third/bootstrap-collapse.js"></script>
  <script src="${skinPath}/js/third/bootstrap-carousel.js"></script>
  <script src="${skinPath}/js/third/bootstrap-typeahead.js"></script>
  <script src="${skinPath}/js/third/bootstrap-affix.js"></script>

</body>
</html>
