<?php



$db = new PDO("sqlite:../../BDD/cuantotardamiautobus-madrid.sqlite");
// $stmt = $db->prepare("insert into tiempos(linea,parada,timestamp,distancia,espera) values (?,?,?,?,?)");




function log_tiempos($linea,$parada,$distancia,$espera)
{
	global $db;

	$db->query("insert into tiempos(linea,parada,timestamp,distancia,espera) values ('$linea', $parada, " . time() . ", $distancia, $espera)");
	// 		$stmt->execute(array( (string)$bus->idLine, (int)$bus->IdStop, time(), (int)$bus->DistanceBus, (int)$bus->TimeLeftBus ));
	// 		trigger_error("insert into tiempos(linea,parada,timestamp,distancia,espera) values ('{$bus->idLine}', {$bus->IdStop}, " . time() . ", {$bus->DistanceBus}, {$bus->TimeLeftBus});", E_USER_NOTICE );
	// 		trigger_error("code" . $db->errorCode() . " info " . var_export($db->errorInfo(),1) , E_USER_NOTICE );

	check_db_errors();
}



function log_parada($parada,$nombre,$x,$y)
{
	global $db;

	$db->query("insert into paradas(parada,x,y,nombre) values ($parada, $x, $y, '$nombre')")
// 	or
// 	$db->query("update paradas set nombre='$nombre', utm_x=$x, utm_y=$y where parada=$parada")
	;

	check_db_errors();
}



function log_parada_linea($linea,$parada,$sentido,$x,$y,$nombre,$distancia)
{
	global $db;

// 	trigger_error ("$linea,$parada,$sentido,$x,$y,$nombre,$distancia", E_USER_NOTICE);

// 	log_parada($parada,$nombre,$x,$y);


	$db->query("insert into lineas_paradas(linea,parada,sentido,distancia,timestamp) values ('$linea',$parada, $sentido, $distancia, " . time() . ")")
// 	or
// 	$db->query("update lineas_paradas set distancia=$distancia, timestamp=" . time() . " where parada=$parada and linea='$linea' and sentido=$sentido")
	;

	check_db_errors();
}






function check_db_errors()
{
	global $db;

	// Skip '00000' (all OK) and '23000' (primary key dupe)

	if ($db->errorCode() != '00000' && $db->errorCode() != '23000')
// 	if ($db->errorCode() != '00000')
		trigger_error("code" . $db->errorCode() . " info " . implode(',',$db->errorInfo()) , E_USER_WARNING );


// 	PHP Notice:  codeHY000 info HY000,8,attempt to write a readonly database in /home/ivan/devel/cuantotardamiautobus_v1/src/madrid/conexion_bd_madrid.php

}




