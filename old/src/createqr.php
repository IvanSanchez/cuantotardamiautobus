<?php


/// TODO: comprobar otras ciudades válidas

if ($_REQUEST['ciudad'] == 'madrid')
{
	$ciudad = 'madrid';
}
else
{
	$ciudad = null;
}


if (isset($_REQUEST['parada']) && is_numeric($_REQUEST['parada']) && $ciudad)
{
	$parada   = (int) $_REQUEST['parada'];
	$qr_text  = "http://www.cuantotardamiautobus.es/$ciudad/qr.php#parada=$parada";
	$noqr_url = "http://www.cuantotardamiautobus.es/$ciudad/#parada=$parada";
}
else
{
	$qr_text = 'Nice try.';
	$parada = '';
	$noqr_url = '';
}

header('Content-type: text/html; charset=utf-8');

?><!DOCTYPE text/html>
<html>
<head>
<title>Crear código QR para parada de autobús</title>

<link rel="stylesheet" href="main.css" />

<style>

body
{
	padding: 1cm;
}

div#qrcode canvas
{
	width:8cm;
	height:8cm;
}

div#qrcode
{
	min-width:8cm;
	width:8cm;
	height:8cm;
	margin:1cm;
	margin-left:auto;
	margin-right:auto;
}


div.printpage
{
	width:13cm;
	padding:1cm;
	text-align:center;
}


@media screen {
  div.noprint
  {
	  display:block;
  }

  div.onlyprint
  {
	  display:none;
  }
}

@media print {
  div.noprint
  {
	  display:none;
  }

  div.onlyprint
  {
	  display:block;
  }


}

</style>

<script src="jquery/jquery-1.8.3-min.js"></script>
<script src="jquery/jquery.qrcode.min"></script>

<script type="text/javascript">

$(document).ready(function(){

	$('#qrcode').qrcode({
		text	: "<?php echo $qr_text; ?>"
	});

});

</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="description" content="Consulta cuánto tarda el próximo autobús de la EMT Madrid en tu zona." />

</head>
<body>

<div class='noprint'>

<p>¿Tienes un teléfono móvil capaz de escanear códigos QR? ¿Y usas habitualmente la parada nº <?php echo $parada; ?>? ¿Y una impresora y algo de celo?</p>

<p>Pues imprímete esta página, pégala cerca de tu parada de autobús, y escaneando el código podrás ver cuánto tarda el siguiente autobús en llegar. Si la pegas un un lugar público (y, por favor, que no estorbe ni moleste), otras personas también podrán saber cuánto tienen que esperar.</p>

</div>



<div style='border:1px solid black;' class='printpage'>


<h1>Escanea este código para consultar cuánto tarda el próximo autobús:</h1>


<div id='qrcode'></div>

<p>Si no puedes escanear el código, también puedes consultar <a href='<?php echo $noqr_url; ?>'><?php echo $noqr_url; ?></a></p>



<?php

if ($ciudad == 'madrid')
echo "
<div class='onlyprint'>
	<p><small style='font-size:33%'>Este servicio <strong>no</strong> está ni ofrecido ni patrocinado por:</small></p>
	<img style='width:3.25cm; height:4cm;' src='https://lh3.ggpht.com/-MV7lzRqWrkg/Tnht3bsCohI/AAAAAAAAH_A/thFRihFxM9k/s1600/EMT.jpg'/>
</div>
";

// 	<!-- <img style='width:2.25cm; height:4cm;' src='http://profejoseluis.es/Logo%20Ayuntamiento%20Madrid.jpg'/>

?>

</div>


</body>
</html>