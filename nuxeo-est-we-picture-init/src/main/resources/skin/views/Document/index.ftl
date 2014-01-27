<@extends src="base.ftl">

<@block name="content">

<p>La photo a bien été attachée au Livre ${Document.title}</p>
<p>Toutefois si vous voulez revenir sur ce document, il est possible en cliquant sur le bouton suivant, sinon attendez vous allez être rediriger vers la page d'import</p>

<a href="${Root.path}/nxid-remove/${Document.id}">Annulation</a>

<script src="${skinPath}/js/redirect.js"></script>

</@block>
</@extends>
