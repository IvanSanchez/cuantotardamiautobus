<?php
header('Content-type: text/html; charset=utf-8');
?><!DOCTYPE text/html>
<html>
<head>
<title>¿Cuánto tarda mi autobús?</title>

<script type="text/javascript">
<?php

// Este script tan sólo redirige a index.php pasando también el hash que se recibe aquí.
// El objetivo de esto es que las peticiones a QR aparezcan por separado de las normales.

// TODO: // He visto esta parada a partir de un QR, no me muestres el enlace
//localStorage.setItem('qr' + window.location.hash, true);

?>

window.location = "./" + window.location.hash;

</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="description" content="Consulta cuánto tarda el próximo autobús de la EMT Madrid en tu zona." />

</head>
<body>
</body>
</html>