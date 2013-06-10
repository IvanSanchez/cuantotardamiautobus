<?php


require('conexion_bd_madrid.php');


$ids_parada = @$_REQUEST['ids_parada'];

// if (!$ids_parada) $ids_parada = array(550);
if (!$ids_parada) $ids_parada = array(69);


set_error_handler( function( $errno, $errstr, $errfile, $errline, $errcontext ) {
	header("Content-type: text/json");

	echo json_encode(array("Error"=>array($errno, $errstr, $errline)) );
// 	echo json_encode(array("Error"=>array($errno, $errstr, $errfile, $errline, $errcontext)) );
	die();
});

	$client = new SoapClient("https://servicios.emtmadrid.es:8443/geo/ServiceGEO.asmx?WSDL", array());
// 	$client = new SoapClient("https://servicios.emtmadrid.es:8443/geo/ServiceGEO.asmx?WSDL", array('trace' => 1));

restore_error_handler();


$autobuses = array();


foreach($ids_parada as $id_parada)
{
	$id_parada = (int) $id_parada;

	$foo = $client->getArriveStop(
		array('idClient'=>$auth['ServiceGEO']['idClient']
		,'passKey'=>$auth['ServiceGEO']['passKey']
		,'idStop'=> $id_parada
		,'statistics'=>''
		,'cultureInfo'=>'es') );

// 	print_r($foo);

	$foo2 = simplexml_load_string($foo->getArriveStopResult->any);

// 	print_r($foo2);

// 	if (!is_array($foo2->Arrive))
// 		$buses = array($foo2->Arrive);
// 	else
// 		$buses = $foo2->Arrive;

	foreach($foo2->Arrive as $bus)
	{
		$autobuses[] = array('parada'    => (string)$bus->IdStop
	                    ,'linea'     => (string)$bus->idLine
// 	                    ,'cabecera'   => (string)$bus->IsHead
	                    ,'destino'   => mb_convert_case((string)$bus->Destination, MB_CASE_TITLE, 'UTF-8')
	                    ,'idbus'     => (string)$bus->IdBus
	                    ,'segundos'  => (string)$bus->TimeLeftBus
	                    ,'distancia' => (string)$bus->DistanceBus
	                    ,);

		log_tiempos((string)$bus->idLine, (string)$bus->IdStop, (string)$bus->DistanceBus, (string)$bus->TimeLeftBus);

	}
}


/// Ordenar por tiempos de llegada

usort($autobuses, function($a,$b) { return $a['segundos'] > $b['segundos']; }  );





// print_r ($client->__getLastRequest());
// print_r ($client->__getLastResponse());

// print_r($foo);


// print_r($autobuses);

header("Content-type: text/json");

echo json_encode($autobuses);



/*

<Arrives xmlns="">
	<Arrive>
		<IdStop>550</IdStop>
		<idLine>N16</idLine>
		<IsHead>True</IsHead>
		<Destination>LA PESETA</Destination>
		<IdBus>0000</IdBus>
		<TimeLeftBus>38</TimeLeftBus>
		<DistanceBus>644</DistanceBus>
		<PositionXBus>-1</PositionXBus>
		<PositionYBus>-1</PositionYBus>
		<PositionTypeBus>2</PositionTypeBus>
	</Arrive>

	<Arrive>
		<IdStop>550</IdStop>
		<idLine>N16</idLine>
		<IsHead>True</IsHead>
		<Destination>LA PESETA</Destination>
		<IdBus>0000</IdBus>
		<TimeLeftBus>584</TimeLeftBus>
		<DistanceBus>4057</DistanceBus>
		<PositionXBus>-1</PositionXBus>
		<PositionYBus>-1</PositionYBus>
		<PositionTypeBus>1</PositionTypeBus>
		</Arrive>
	</Arrives>

*/
