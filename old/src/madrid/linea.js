



var mostrar_mapa_linea;

var tiempos_mapa_linea;

var datos_linea_mostrada;
var id_linea_mostrada;

/// TODO: actualizar automáticamente el gráfico de la línea, y meter una variable para quitar el setinterval() cuando se oculte la pantalla.



$(document).ready(function(){


	mostrar_mapa_linea = function(linea){

		id_linea_mostrada = linea;

// 		$('#overlay-background').show();

		$('#overlay').empty();
		$('#overlay').html("<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show(); id_linea_mostrada = undefined;\" class='clickable backbutton'>Volver al mapa</span></div><h2>Obteniendo estructura de línea...</h2>");
		$('#overlay-background').show();
		$('#overlay').show();
		$('.leaflet-control').hide();

		// Una pista para el permalink de esta parada
		window.location.hash = "linea=" + linea;


		$.ajax({
			url: "linea.php?t=" + (new Date().getTime()) + "&id_linea=" + linea
// 			url: "linea17.json"
		}).done(function( data ) {

			datos_linea_mostrada = sentidos = data;

// 			console.log(data);

			var texto = "<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show(); window.location.hash = '';\" class='clickable backbutton'>Volver al mapa</span></div><h2>Línea " + id_linea_mostrada + "</h2><div id='tooltip_mapa_linea'>Calculando tiempos y posiciones de autobuses...</div><p>";


			var tabla_linea = $("<table id='tabla_linea'></table>");

			$('#overlay').empty().show();
			$('#overlay').html(texto);
			$('#overlay').append(tabla_linea);
			tiempos_mapa_linea();

			for (i=0; i<sentidos[1].length; i++)
			{
				var linea = $('<tr></tr>');
				var grafico = '';
				var classgrafico = '';

// 				console.log(sentidos[1][i]);

				if (i==0)
				{
					grafico = '../img/20px-BSicon_KBHFa.svg.png';
					classgrafico = '';
				}
				else if (i == sentidos[1].length-1)
				{
					grafico = '../img/20px-BSicon_KBHFe.svg.png';
					classgrafico = '';
				}
				else
				{
					grafico = '../img/20px-BSicon_BHF.svg.png';
					classgrafico = 'grafico';
				}

				linea.append($("<td id='linea_s1_p" + i + "_nombre' class='nombre_sentido_1'>" +
					"<span class='clickable' onclick='centrar_y_desplegar_parada(" + (sentidos[1][i].r) + "); id_linea_mostrada = undefined;'>" +
					(sentidos[1][i].n) + " (" + (sentidos[1][i].r) + ")</span></td>"));
				linea.append($("<td id='linea_s1_p" + i + "_tiempo' class='tiempo'></td>"));
				linea.append($("<td id='linea_s1_p" + i + "_grafico' class='" + classgrafico + "'><img src='" + grafico + "'></td>"));

				tabla_linea.append(linea);

				// Si no es la última parada, añadir espacio para mostrar los autobuses entre paradas y los sentidos de la línea
				if (i < sentidos[1].length-1)
				{
					var linea = $('<tr></tr>');
					linea.append($("<td></td>"));
					linea.append($("<td id='linea_s1_p" + i + "_inter' class='tiempo inter'></td>"));
					linea.append($("<td id='linea_s1_p" + i + "_postgrafico' class='grafico'><img src='../img/20px-BSicon_STRf.svg.png'></td></td>"));
					tabla_linea.append(linea);
				}
			}

			/// FIXME: algoritmo guay para cuadrar líneas en base al nombre de las paradas
			// Esto cuadra el caso de que la línea tenga más paradas en el sentido 2 que en el 1.
			if (sentidos[2].length > sentidos[1].length)
			{
				for (i = sentidos[1].length; i <= sentidos[2].length; i++)
				{
					tabla_linea.append( $('<tr><td></td><td></td><td></td></tr>') );
					tabla_linea.append( $('<tr><td></td><td></td><td></td></tr>') );
				}
			}

			// Ponemos las paradas del sentido de vuelta, pero esta vez todo al revés y añadiendo celdas a las filas ya existentes
			for (i=0; i<sentidos[2].length; i++)
			{
				var j = sentidos[2].length - i - 1;
				var linea = $( $('#tabla_linea').children().children()[i*2] );
				var grafico = '';
				var classgrafico = '';

// 				console.log(sentidos[2][i]);

				if (i==0)
				{
					grafico = '../img/20px-BSicon_KBHFa.svg.png';
					classgrafico = '';
				}
				else if (i == sentidos[2].length-1)
				{
					grafico = '../img/20px-BSicon_KBHFe.svg.png';
					classgrafico = '';
				}
				else
				{
					grafico = '../img/20px-BSicon_BHF.svg.png';
					classgrafico = 'grafico';
				}

				linea.append($("<td id='linea_s2_p" + i + "_grafico' class='" + classgrafico + "'><img src='" + grafico + "'></td>"));
				linea.append($("<td id='linea_s2_p" + i + "_tiempo' class='tiempo'></td>"));
				linea.append($("<td id='linea_s2_p" + i + "_nombre' class='nombre_sentido_2'>" +
					"<span class='clickable' onclick='centrar_y_desplegar_parada(" + (sentidos[2][j].r) + "); id_linea_mostrada = undefined;'>" +
					(sentidos[2][j].n) + " (" + (sentidos[2][j].r) + ")</span></td>"));

// 				tabla_linea.append(linea);

				// Si no es la última parada, añadir espacio para mostrar los autobuses entre paradas y los sentidos de la línea
				if (i < sentidos[2].length-1)
				{
					var linea = $( $('#tabla_linea').children().children()[i*2 + 1] );
					linea.append($("<td id='linea_s2_p" + i + "_postgrafico' class='grafico'><img src='../img/20px-BSicon_STRg.svg.png'></td></td>"));
					linea.append($("<td id='linea_s2_p" + i + "_inter' class='tiempo inter'></td>"));
					linea.append($("<td></td>"));
// 					tabla_linea.append(linea);
				}
			}

		});
	};




	tiempos_mapa_linea = function(){

		// ¿Cuántas paradas hay en la línea y qué IDs tienen?

		var query_string = '';
		var count = 0;

		for (sentido = 1; sentido <= 2; sentido++)
		{
			for (i=0; i<datos_linea_mostrada[sentido].length; i++)
			{
				query_string += "ids_parada[" + count + "]=" + datos_linea_mostrada[sentido][i].r + "&";
				count++;
			}
		}

		$.ajax({
			// Lanzamos la petición para obtener el JSON con los tiempos. Se incluye el tiempo actual (época unix) para evitar cachés y todo ese rollo.
			url: "tiempos.php?t=" + (new Date().getTime()) + "&" + query_string,
// 			url: "tiempos17_noche.json"
		}).done(function( data ) {

// 			console.log(data);

			// Hay que filtrar y ordenar la respuesta

			// Preparativos
			var backreferences = new Array();

			for (i=0; i<datos_linea_mostrada[1].length; i++)
			{
				datos_linea_mostrada[1][i].buses = new Array();
				backreferences[ datos_linea_mostrada[1][i].r ] = {sentido:1, id:i};
			}
			for (i=0; i<datos_linea_mostrada[2].length; i++)
			{
				datos_linea_mostrada[2][i].buses = new Array();
				backreferences[ datos_linea_mostrada[2][i].r ] = {sentido:2, id: i};
			}

			// Iteramos sobre los resultados devueltos por tiempos.php
			// Los datos se añaden al array de paradas en la línea
			for (i=0; i<data.length; i++)
			{
				if (data[i].linea == id_linea_mostrada)
				{
// 					console.log(data[i] );
					datos_linea_mostrada[ backreferences[data[i].parada].sentido ][ backreferences[data[i].parada].id ].buses.push(data[i]);
// 					console.log(data[i].parada, backreferences[data[i].parada].sentido, backreferences[data[i].parada].id, data[i] );
				}
				/// TODO: poner un flag en la parada cuando haya buses de otra línea pasando por ella, para cambiar el icono después si eso.
			}

			// Con el lío de las backreferences, hace falta cuadrar las cabeceras de línea, que habitualmente comparten ID de parada
			// El primero del sentido 1 suele ser igual al último del sentido 2 y viceversa
			if (datos_linea_mostrada[1][0].r == datos_linea_mostrada[2][ datos_linea_mostrada[2].length-1 ].r)
			{
				datos_linea_mostrada[1][0].buses = datos_linea_mostrada[2][ datos_linea_mostrada[2].length-1 ].buses;
			}
			if (datos_linea_mostrada[1][ datos_linea_mostrada[1].length-1 ].r == datos_linea_mostrada[2][ 0 ].r)
			{
				datos_linea_mostrada[1][ datos_linea_mostrada[1].length-1 ].buses = datos_linea_mostrada[2][ 0 ].buses;
			}


// 			console.log("linea", datos_linea_mostrada, "backrefs", backreferences, "tiempos", data);

			// Se vacían los iconos de bus inter-paradas, just in case. Si hay un bus entre dos paradas, se pondrá después.
			$(".inter").empty();



			// OK, tenemos los tiempos de los buses de esta línea en cada parada. Iteramos sobre las paradas y metemos info en HTML:
			var tiempo_parada_anterior = NaN;	// Distancia del primer bus a la parada anterior.
			     // Según vamos iterando, esto sube y sube porque el autobús está más lejos de las paradas siguientes
			     // Pero si decrece, eso quiere decir que hay un autobús en algún lado.
			for (sentido = 1; sentido <= 2; sentido++)
			{
				var i;
				var start;
				var end;
				var iterator;
				if (sentido == 1)
				{
					icono_bus = "<img src='../img/BSicon_BUS.svg.png'/>";
				}
				else
				{
					icono_bus = "<img src='../img/BSicon_BUS.svg.png'/>";
				}

				for (i=0; i < datos_linea_mostrada[sentido].length ; i ++)
				{
	// 				datos_linea_mostrada[sentido][sentido].buses = new Array();
	// 				backreferences[ datos_linea_mostrada[sentido][i].r ] = {sentido:1, id:i};
					var j;
					if (sentido == 1)
					{
						j = i;	// j es la fila en la que se muestra la parada i del sentido
						j2 = j-1;	// j2 es la fila donde se muestra el autobusito si está entre dos paradas, antes de llegar a la parada en cuestión.
						j3 = j; 	// j3 es donde se muestra el autobús si está antes de llegar a la siguiente y ya ha salido de la mía
					}
					else
					{
						j = datos_linea_mostrada[2].length-i-1;
						j2 = j;
						j3 = j-1;
					}

					var distancia0;
					var tiempo0;
					var distancia1;
					var tiempo1;

					// ¿Pasan autobuses por esta parada a esta hora del día/noche?
					if (typeof(datos_linea_mostrada[sentido][i].buses[0]) != "undefined")
					{
						// La distancia la miden vete tú a saber cómo. Igual en línea recta hasta la parada en vez de distancia medida encima de la línea.
						distancia0 = parseInt(datos_linea_mostrada[sentido][i].buses[0].distancia);
						tiempo0 = parseInt(datos_linea_mostrada[sentido][i].buses[0].segundos);
					}

					if (typeof(datos_linea_mostrada[sentido][i].buses[1]) != "undefined")
					{
						var distancia1 = parseInt(datos_linea_mostrada[sentido][i].buses[1].distancia);
						var tiempo1 = parseInt(datos_linea_mostrada[sentido][i].buses[1].segundos);


					}

					var tiempo = tiempo0;

					var adelantar_bus = false;

					// Si la distancia al primer autobús es negativa, voy a suponer que ya ha salido, y poner el tiempo al segundo autobús.
					// Si no, ese aubotús se muestra dos veces, porque EMT muestra un tiempo de 0:00 para esta parada y la siguiente.
					// Si se trata del último autobús del día, pues lo ponemos a undefined (=tiempo1) para que salga un "Sin servicio" y fuera.
					if (distancia0 < 0)
					{
						console.log("Cambiado tiempo por tiempo al 2º autobús, por estar a distancia menor que cero. (" + datos_linea_mostrada[sentido][i].r + ")  d[" + distancia0 + ", " + distancia1 + "] t[" + tiempo0 + ", " + tiempo1 + "]");
						adelantar_bus = true;
					}

					if (   tiempo0 == 0
					    && i < datos_linea_mostrada[sentido].length - 1
					    && typeof(datos_linea_mostrada[sentido][i+1].buses[0]) != "undefined"
					    && datos_linea_mostrada[sentido][i+1].buses[0].segundos == 0
					   )
					{
						adelantar_bus = true;
						console.log("Cambiado tiempo por tiempo al 2º autobús, por estar en la siguiente. (" + datos_linea_mostrada[sentido][i].r + ")  d[" + distancia0 + ", " + distancia1 + "] t[" + tiempo0 + ", " + tiempo1 + "]");
					}


					if (adelantar_bus)
					{
						tiempo = tiempo1;


						// ¿Hay un autobús en la próxima parada?
						if (i < datos_linea_mostrada[sentido].length - 1
						    && typeof(datos_linea_mostrada[sentido][i+1].buses[0]) != "undefined"
						    && datos_linea_mostrada[sentido][i+1].buses[0].segundos == 0)
						{
							// Ah, entonces perdona
							console.log("Ya ha salido, y está en la próxima parada.");
						}
						else
						{
							// Si no ha llegado, pues habrá que ponerlo.
							console.log("Ya ha salido, pero todavía no ha llegado a la próxima parada. j=" + j + " j2=" + j2 + " j3=" + j3);
							$("#linea_s" + sentido + "_p" + j3 + "_inter").html( icono_bus ).attr("title","Avanzado por distancia negativa o doble tiempo cero");
						}
					}


					// Si hay un autobús a tiempo cero de la *próxima* parada en el sentido, voy a suponer que ya ha salido de esta.
					// Se puede dar el caso de dos autobuses adyacentes, pero de momento parace es más probable que estos casos sean errores.




					if (typeof( tiempo ) != 'undefined' )
					{
						// Si el autobús más cercano está a menos de 5 segundos de distancia, asumo que ya está en la parada.
						if (tiempo < 5)
						{
							// No mostrar el icono del bus si estoy en el final de la línea y la ID coincide con la cabecera del otro sentido (3-sentido)
							if ( i == (datos_linea_mostrada[sentido].length - 1)  &&
								(datos_linea_mostrada[3-sentido][0].r == datos_linea_mostrada[sentido][ i ].r)
							)
							{
								$("#linea_s" + sentido + "_p" + j + "_tiempo").html("-");
							}
							else
							{
								$("#linea_s" + sentido + "_p" + j + "_tiempo").html( icono_bus ).removeClass('countdown');
							}
						}
						else	// Si el autobús no está en la parada, poner el tiempo y (opcionalmente) un autobús entre paradas.
						{
							if (tiempo < tiempo_parada_anterior -25)	// Si se tarda menos en una parada posterior, es que hay un autobús entre medias. El "-25" es porque a veces, sólo a veces, EMT devuelve los tiempos fuera de orden. Puede ser por el tiempo que tarda la petición.
							{
								$("#linea_s" + sentido + "_p" + j2 + "_inter").html( icono_bus ).attr('title', tiempo + " < " + (tiempo_parada_anterior-25) + " - " + tiempo_parada_anterior);
							}
							var minutos  = Math.floor(tiempo / 60);
							var segundos = tiempo % 60;
							if (segundos < 10)
								segundos = "0" + segundos;

							var tiempo_str = minutos + ":" + segundos;
							if (tiempo == 999999)
								tiempo_str = "20+";

							$("#linea_s" + sentido + "_p" + j + "_tiempo").html( tiempo_str ).addClass('countdown');

						}
						$("#linea_s" + sentido + "_p" + j + "_tiempo").attr("title", "d[" + distancia0 + ", " + distancia1 + "] t[" + tiempo0 + ", " + tiempo1 + "]");

						tiempo_parada_anterior = tiempo0;
// 						console.log(sentido, datos_linea_mostrada[sentido][i].r, tiempo0);
					}
					else
					{
						// Sin autobuses en esa parada
						$("#linea_s" + sentido + "_p" + j + "_tiempo").html( "<small>Sin servicio</small>" );
						tiempo_parada_anterior = 1200;	// Le ponemos algo, para que salga el último autobús.
// 						console.log(sentido, datos_linea_mostrada[sentido][i].r, "---");
					}
				}
			}

			$('#tooltip_mapa_linea').html("<small>Las posiciones de autobuses se calculan a partir de los tiempos de parada mediante métodos heruísticos y pueden no ser precisas.</small>");

// 			<br/>A veces un autobús puede aparecer (erróneamente) en dos paradas adyacentes. Culpa de los datos de entrada, algún día le preguntaré a <a href='http://www.twitter.com/EMTmadrid'>@EMTmadrid</a> porqué pasa esto.

		});


	};


	// Recargar la línea entera cada 30 segundos
	setInterval( function() {
		if (typeof(id_linea_mostrada) != 'undefined')
			tiempos_mapa_linea();
	}, 30000);




});


