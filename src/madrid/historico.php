<?php

include ('conexion_bd_madrid.php');



$stmt = $db->query("select
	l.linea, l.distancia+t.distancia as distancia, l.distancia as distl, t.distancia as distt, espera, t.timestamp
from
	lineas_paradas l, tiempos t
where
	l.linea='T61'
	and t.linea=l.linea
order by
	t.timestamp asc");


echo json_encode($stmt->fetchAll());
