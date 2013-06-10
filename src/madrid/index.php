<?php
header('Content-type: text/html; charset=utf-8');
?><!DOCTYPE text/html>
<html>
<head>
<title>¿Cuánto tarda mi autobús?</title>

<link type="text/plain" rel="author" href="http://ivan.sanchezortega/humans.txt" />

<link rel="stylesheet" href="../leaflet-0.4.5/leaflet.css" />
<!--[if lte IE 8]>
    <link rel="stylesheet" href="../leaflet-0.4.5/leaflet.ie.css" />
<![endif]-->

<script src="../leaflet-0.4.5/leaflet.js"></script>
<script src="../leaflet-0.4.5/Permalink.js"></script>

<script src="../jquery/jquery-1.8.3-min.js"></script>

<script src="main.js" type="text/javascript"></script>
<script src="linea.js" type="text/javascript"></script>

<link rel="stylesheet" href="../main.css" />

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="description" content="Consulta cuánto tarda el próximo autobús de la EMT Madrid en tu zona." />
<link rel="icon" type="image/png" href="../img/logo_v1_rojo_128px.png" />
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="../img/logo_v1_rojo_114px.png">
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="../img/logo_v1_rojo_72px.png">
<link rel="apple-touch-icon-precomposed" href="../img/logo_v1_rojo_57px.png">



</head>
<body>


<div id='map' style='position:absolute; top:0; bottom:0; left:0; right:0;'></div>

<div class='statusbar'>
<span id='zoomtip'>Haga zoom para ver paradas</span>
<span id='search' class='clickable' onclick="$('#overlay').show(); $('#overlay-background').show(); $('.leaflet-control').hide(); mostrar_buscar();" >Buscar</span>
<span id='about' class='clickable' onclick="$('#overlay-about').show(); $('#overlay-background').show(); $('.leaflet-control').hide();" >Acerca de</span>
</div>

<div id='overlay-background' style='z-index:19; bottom:0;'></div>

<div id='overlay' style='z-index:20;'></div>

<div id='overlay-about' style='z-index:30;'>

<div><span onclick="$('#overlay-about').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();" class='clickable backbutton'>Volver al mapa</span></div>

<?php include('include/about.html'); ?>

</div>


</body>
</html>