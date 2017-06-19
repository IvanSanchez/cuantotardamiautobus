<?php



$resultados = file_get_contents("http://nominatim.openstreetmap.org/search".
// 		"?q=" . URLEncode($_REQUEST['q'] . ", Madrid, Madrid, Spain") .
		"?street=" . URLEncode($_REQUEST['q'] ) . "&city=Madrid&country=Spain&state=Madrid&county=Madrid" .
// 		"&viewbox=-3.79942,lat=40.538501,-3.52012,40.36606" .
		"&format=json&limit=10&user-agent=cuantotardamiautobus&email=ivan@sanchezortega.es");

//  street=<housenumber> <streetname>
//  city=<city>
//  county=<county>
//  state=<state>
//  country=<country>
//  postalcode=<postalcode>

header("Content-type: text/json");

// echo json_encode($coords);

echo $resultados;



