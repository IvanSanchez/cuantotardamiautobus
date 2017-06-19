<?php
header('Content-type: text/html; charset=utf-8');
?><!DOCTYPE text/html>
<html>
<head>
<title>¿Cuánto tarda mi autobús?</title>

<link type="text/plain" rel="author" href="http://ivan.sanchezortega/humans.txt" />

<script src="../jquery/jquery-1.8.3-min.js"></script>

<!-- <script src="main.js" type="text/javascript"></script> -->
<script src="linea.js" type="text/javascript"></script>

<link rel="stylesheet" href="../main.css" />

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="description" content="Consulta cuánto tarda el próximo autobús de la EMT Madrid en tu zona." />

</head>
<body>


<div id='overlay-background' style='z-index:19; bottom:0;'></div>

<div id='overlay' style='z-index:20;'></div>

<script type='text/javascript'>
$(document).ready(function(){

<?php

if ($_REQUEST['linea'])
	$linea = $_REQUEST['linea'];
else
	$linea = 17;
echo "	mostrar_mapa_linea(\"$linea\");";
?>
});
</script>

</body>
</html>