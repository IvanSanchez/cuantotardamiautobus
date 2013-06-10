<?php

require('conexion_bd_madrid.php');
require('auth.php');

$id_linea = @$_REQUEST['id_linea'];

// if (!$ids_parada) $ids_parada = array(550);
if (!$id_linea) $id_linea = 17;


set_error_handler( function( $errno, $errstr, $errfile, $errline, $errcontext ) {
	header("Content-type: text/json");

	echo json_encode(array("Error"=>array($errno, $errstr, $errline)) );
// 	echo json_encode(array("Error"=>array($errno, $errstr, $errfile, $errline, $errcontext)) );
	die();
});

	$client = new SoapClient("https://www.emtmadrid.es/MapaWebServicios/ServiciosMapaWeb.asmx?wsdl", array());
// 	$client = new SoapClient("https://servicios.emtmadrid.es:8443/geo/ServiceGEO.asmx?WSDL", array('trace' => 1));

restore_error_handler();



$paradaslinea = array();

// $id_linea = (int) $id_linea;

$foo = $client->ListadoParadasLinea(array('idClient'=>$auth['ServiciosMapaWeb']['idClient']
                                         ,'passKey'=>$auth['ServiciosMapaWeb']['passKey']
                                         ,'ID'=>$id_linea
                                         ,'SENTIDO'=>3
                                         ,'FECHA'=> ''));



$data = simplexml_load_string($foo->ListadoParadasLineaResult->any);


foreach($data->LISTADOPARADAS as $parada)
{
// 		print_r($coords);
	$x = (float)$parada->X;
	$y = (float)$parada->Y;
	$nombreparada = (string) $parada->NOMBREPARADA;
	$sentido   = (int) $parada->SENTIDO;
	$tipo      = (int) $parada->TIPO;
	$distancia = (int) $parada->DISTANCIA;	// Distancia desde el principio de la línea
	$ref       = (int) $parada->NODO;
// 		printf("%09.2f %09.2f t%1d s%1d r%05d %s \n", $x, $y, $tipo, $sentido, $ref, $nombreparada);
// 		echo "$x,$y o$ordenvial s$sentido $distancia \n";

	$nombreparada = mb_convert_case((string)$nombreparada, MB_CASE_TITLE, 'UTF-8');

	$paradaslinea[$sentido][] = array('x'=>$x, 'y'=>$y, 'r'=>$ref, 'n'=>$nombreparada, 'd'=>$distancia, 't'=>$tipo);
// 	$paradas[$ref] = array('x'=>$x, 'y'=>$y, 'n'=>$nombreparada);


	log_parada_linea($id_linea,$ref,$sentido,$x,$y,$nombreparada,$distancia);

}



header("Content-type: text/json");

echo json_encode($paradaslinea);

// print_r ($client->__getLastRequest());
// print_r ($client->__getLastResponse());
//
// print_r($foo);



/*
{"1":
	[{"x":440136,"y":4474138,"r":544,"n":"Concepcion Jeronima"}
	,{"x":440008,"y":4473880,"r":545,"n":"Toledo-La Latina"}
	,{"x":439834,"y":4473600,"r":547,"n":"Toledo-Humilladero"}
	,{"x":439751,"y":4473452,"r":2589,"n":"Toledo-La Paloma"}
	,{"x":439637,"y":4473334,"r":549,"n":"P\u00ba Pontones-Ronda Segovia"}
	,{"x":439376,"y":4473162,"r":550,"n":"P\u00ba Pontones-P\u00ba Imperial"}
	,{"x":439024.1,"y":4473075.5,"r":552,"n":"P\u00ba Pontones-P\u00ba Melancolicos"}
	,{"x":438620,"y":4473036,"r":554,"n":"P\u00ba Ermita Del Santo-Pte.san Isidro"}
	,{"x":438089,"y":4472804,"r":555,"n":"Via Carpetana-Caramuel"}
	,{"x":437696,"y":4472416,"r":557,"n":"Via Carpetana-Gallur"}
	,{"x":437518,"y":4472236,"r":559,"n":"Via Carpetana-Mochuelo"}
	,{"x":437427,"y":4472077,"r":561,"n":"Via Carpetana-Dr.zofio"}
	,{"x":437293,"y":4471925,"r":563,"n":"Via Carpetana-Ntra.sra.valvanera"}
	,{"x":437049,"y":4471679,"r":564,"n":"Via Carpetana-Laguna"}
	,{"x":436953,"y":4471489,"r":566,"n":"Via Carpetana-Petirrojo"}
	,{"x":436888,"y":4471328,"r":567,"n":"Via Carpetana-Gta.del Ejercito"}
	,{"x":436497,"y":4471027,"r":4882,"n":"C\u00ba Ingenieros-Ntra.sra.de La Luz"}
	,{"x":436296,"y":4471145,"r":4881,"n":"Ntra.sra.de La Luz-Oca\u00f1a"}
	,{"x":436137,"y":4470987,"r":570,"n":"Oca\u00f1a N\u00ba 69"}
	,{"x":436004,"y":4470873,"r":4543,"n":"Oca\u00f1a N\u00ba 41"}
	,{"x":435777,"y":4470903,"r":572,"n":"Oca\u00f1a N\u00ba 21"}
	,{"x":435658,"y":4471019,"r":574,"n":"Oca\u00f1a-Camarena"}
	,{"x":435516.75,"y":4471116.5,"r":575,"n":"Intercambiador De Aluche"}
	,{"x":435241,"y":4470952,"r":4505,"n":"Av.gral.fanjul-Guare\u00f1a"}
	,{"x":435155,"y":4470826,"r":578,"n":"Rafael Finat-Av.gral.fanjul"}
	,{"x":434937,"y":4470592,"r":580,"n":"Rafael Finat N\u00ba 36"}
	,{"x":434678,"y":4470306,"r":582,"n":"Rafael Finat-Jose De Cadalso"}
	,{"x":434543.469,"y":4470190.5,"r":365,"n":"Gral.romero Basart-Rafael Finat"}
	,{"x":434355.281,"y":4470379,"r":584,"n":"Gral.romero Basart-O.plasencia"}
	,{"x":434291,"y":4470629,"r":587,"n":"Gral.romero Basart-Gral.fanjul"}
	,{"x":434010,"y":4470659,"r":3833,"n":"Av.gral.fanjul Frente N\u00ba 60"}
	,{"x":433859,"y":4470839,"r":3835,"n":"Fuente Del Tiro-Fuente Lima"}
	,{"x":433736,"y":4470912,"r":3837,"n":"Fuente Del Tiro-Faustino Cordon"}
	,{"x":433716,"y":4470745,"r":3838,"n":"Fuente De Lima N\u00ba 22"}
	]
,"2":
	[{"x":433716,"y":4470745,"r":3838,"n":"Fuente De Lima N\u00ba 22"}
	,{"x":433858,"y":4470812,"r":3836,"n":"Fuente Del Tiro-Fuente Lima"}
	,{"x":433990,"y":4470658,"r":3834,"n":"Av.general Fanjul  N\u00ba 60"}
	,{"x":433862,"y":4470601,"r":372,"n":"Av.gral.fanjul -Est.renfe Aguilas"}
	,{"x":433912,"y":4470537,"r":371,"n":"Av.gral.fanjul -Est.renfe Aguilas"}
	,{"x":434235,"y":4470634,"r":3124,"n":"Av.gral.fanjul-Gral.romero Basart"}
	,{"x":434391.2,"y":4470290.5,"r":585,"n":"Gral.romero Basart-O.plasencia"}
	,{"x":434539,"y":4470163,"r":366,"n":"Gral.romero Basart-Rafael Finat"}
	,{"x":434724,"y":4470324,"r":583,"n":"Rafael Finat-Jose De Cadalso"}
	,{"x":434985,"y":4470620,"r":581,"n":"Rafael Finat N\u00ba 31"}
	,{"x":435224,"y":4470846,"r":579,"n":"Rafael Finat-Av.gral.fanjul"}
	,{"x":435594.281,"y":4471061.5,"r":5064,"n":"Intercambiador De Aluche"}
	,{"x":435770,"y":4470889,"r":573,"n":"Oca\u00f1a Frente N\u00ba 21"}
	,{"x":436030,"y":4470865,"r":4544,"n":"Oca\u00f1a N\u00ba 12"}
	,{"x":436178,"y":4471005,"r":571,"n":"Oca\u00f1a N\u00ba 100"}
	,{"x":436288,"y":4471125,"r":4705,"n":"Ntra.sra.de La Luz-Oca\u00f1a"}
	,{"x":436476,"y":4471003,"r":4706,"n":"Ntra.sra.de La Luz-C\u00ba Ingenieros"}
	,{"x":436647.969,"y":4470908,"r":588,"n":"Ntra.sra.de La Luz-Ntra.sra.fatima"}
	,{"x":436791,"y":4470969,"r":589,"n":"Ntra.sra.fatima-Fontiveros"}
	,{"x":436940,"y":4471258,"r":590,"n":"P\u00ba Mu\u00f1oz Grandes-Oca"}
	,{"x":436986,"y":4471496,"r":4711,"n":"Via Carpetana-Petirrojo"}
	,{"x":437159,"y":4471758,"r":565,"n":"Via Carpetana-Laguna"}
	,{"x":437409,"y":4472002,"r":5506,"n":"Via Carpetana-Lopez Mezquia"}
	,{"x":437516,"y":4472193,"r":560,"n":"Via Carpetana-Mochuelo"}
	,{"x":437744.063,"y":4472437.5,"r":558,"n":"Via Carpetana-Gallur"}
	,{"x":438156,"y":4472818,"r":556,"n":"Via Carpetana-Caramuel"}
	,{"x":438582,"y":4473208,"r":592,"n":"Via Carpetana-P\u00ba Ermita Del Santo"}
	,{"x":439025,"y":4473049,"r":553,"n":"P\u00ba Pontones-P\u00ba Melancolicos"}
	,{"x":439398,"y":4473127,"r":551,"n":"P\u00ba Pontones-P\u00ba Imperial"}
	,{"x":439718,"y":4473250,"r":593,"n":"Toledo-Puerta De Toledo"}
	,{"x":439770,"y":4473442,"r":4780,"n":"Toledo-La Paloma"}
	,{"x":439891,"y":4473662,"r":548,"n":"Toledo-Humilladero"}
	,{"x":440045,"y":4473910,"r":546,"n":"Toledo-La Latina"}
	,{"x":440136,"y":4474138,"r":544,"n":"Concepcion Jeronima"}
	]
}


*/



