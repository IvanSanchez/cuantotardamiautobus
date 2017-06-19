<?php


$rss = simplexml_load_file('http://feeds.feedburner.com/emtmadrid');
// $rss = simplexml_load_file('../feed_incidencias.xml');

$paradas_lineas = json_decode(file_get_contents('rutas_emt/paradas_lineas.json'));



// print_r($rss);


$incidencias_json = array();

$paradas_afectadas = array();

$id_incidencia = 0;

$date_format = "%d/%m/%Y %H:%M:%S";

$ahora = time();

foreach($rss->channel->item as $incidencia)
{
	$hora_desde = strptime($incidencia->rssAfectaDesde, $date_format);
	$hora_hasta = strptime($incidencia->rssAfectaHasta, $date_format);

	$hora_desde = mktime( $hora_desde['tm_hour'], $hora_desde['tm_min'], $hora_desde['tm_sec'],
	                      $hora_desde['tm_mon']+1, $hora_desde['tm_mday'], 1900 + $hora_desde['tm_year'] );

	$hora_hasta = mktime( $hora_hasta['tm_hour'], $hora_hasta['tm_min'], $hora_hasta['tm_sec'],
	                      $hora_hasta['tm_mon']+1, $hora_hasta['tm_mday'], 1900 + $hora_hasta['tm_year'] );


// // 	echo " $hora_desde $ahora $hora_hasta \n";
// 	echo " $ahora $hora_hasta \n";
// // 	echo " " . date("d/m/Y H:i:s", $hora_desde)
// 	echo " " . date("d/m/Y H:i:s", $ahora)
// 	   . " " . date("d/m/Y H:i:s", $hora_hasta) . "\n";

	if ($hora_hasta > ($ahora - 7200) ) // Ocultar incidencias que terminaron hace dos horas o más.
	{

// 		print_r($incidencia);

		$id_incidencia++;

		$incidencias_json[$id_incidencia] = array
			('titulo'         => (string)$incidencia->title
			,'descripcion'    => strip_tags($incidencia->description)
			,'rssAfectaDesde' => $hora_desde
			,'rssAfectaHasta' => $hora_hasta
			,'rssAfectaDesde2' => (string) $incidencia->rssAfectaDesde
			,'rssAfectaHasta2' => (string) $incidencia->rssAfectaHasta
// 			,'rssAfectaDesde3' => date("d/m/Y H:i:s", $hora_desde)
// 			,'rssAfectaHasta3' => date("d/m/Y H:i:s", $hora_hasta)
			,'link'           => (string) $incidencia->enclosure['url']
			,'lineas'         => (string) $incidencia->category
			);


		foreach($incidencia->category as $linea_afectada)
		{
			$linea_afectada = (string) $linea_afectada;

// 			echo "\n $linea_afectada ";

			if (isset($paradas_lineas->$linea_afectada) &&
				( is_array($paradas_lineas->$linea_afectada) || is_object($paradas_lineas->$linea_afectada)))
			{
				foreach($paradas_lineas->$linea_afectada as $sentido=>$paradas)
				{
					foreach ($paradas as $parada)
					{
// 						echo $parada, " - ";
						$paradas_afectadas[ (string)$parada->r ][$id_incidencia][$linea_afectada] = true;
					}
				}
			}
		}

	}

}

$paradas_json = array();


foreach($paradas_afectadas as $id_parada=>$datos_parada)
{

	$incidencias      = array();
	$lineas_afectadas = array();

	foreach($datos_parada as $id_incidencia=>$lineas)
	{
		$incidencias[$id_incidencia] = true;
		foreach($lineas as $linea=>$foo)
		{
			$lineas_afectadas[$linea] = true;
		}
	}

	ksort($lineas_afectadas);

	$paradas_json[$id_parada] = array('inc'=>array_keys($incidencias),'lin'=>array_keys($lineas_afectadas));
}



// print_r($incidencias_json);
//
// print_r($paradas_afectadas);

header("Content-type: text/json");

echo json_encode ( array('incidencias'=>$incidencias_json , 'paradas'=>$paradas_json) );

