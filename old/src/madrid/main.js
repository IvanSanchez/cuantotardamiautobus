
var map;
var paradas = Array();
var marcadores = Array();

var incidencias = Array();
var paradas_con_incidencia = Array();

var buscar_varias_paradas = function() {};
var centrar_y_desplegar_parada = function() {};
var mostrar_incidencias = function() {};
var mostrar_buscar = function() {};
var buscar = function() {};

var id_parada_mostrada;
var nombre_linea_mostrada;


$(document).ready(function(){

	// create a map in the "map" div, set the view to a given place and zoom

	map = L.map('map').setView([40.416, -3.703], 13);

	// add a CloudMade tile layer with style #997
	layer = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery courtesy <a href="http://www.thunderforest.com/">Andy Allan</a>', maxZoom: 18, prefix:false
	}).addTo(map);

	if (!window.location.hash.slice(1))
		map.locate({setView: true, maxZoom: 18});	// Sólo activar la geolocalización cuando no me pasen un permalink.

	map.addControl(new L.Control.Permalink({text: 'Permalink', layers: [layer]}));

	map.attributionControl.setPrefix(false);

	function onLocationFound(e) {
		var radius = e.accuracy / 2;

// 		L.marker(e.latlng).addTo(map)
// 			.bindPopup("You are within " + radius + " meters from this point").openPopup();

		map.setView(e.latlng,17);

// 		L.circle(e.latlng, radius, {fillOpacity: 0 } ).addTo(map);
	}
//
// 	map.on('locationfound', onLocationFound);
//
// 	function onLocationError(e) {
// 	alert(e.message);
// 	}
//
// 	map.on('locationerror', onLocationError);



	$.ajax({
		url: "incidencias.php",
	}).done(function( data ) {

		incidencias = data.incidencias;
		paradas_con_incidencia = data.paradas;

		// Normalmente, debería recargar todas las paradas en el encuadre al cargar las incidencias. Sin embargo, esto hace que los permalinks a parada se caigan hasta que no esté corregido lo de no ocultar las paradas y volver las a mostrar cada vez que se hace un encuadre.
		if (!window.location.hash.slice(1))
			mostrar_paradas();
	});

	$.ajax({
		url: "rutas_emt/emt-paradas.json",
	}).done(function( data ) {

		paradas = data;

		// Ahora que ya tengo las paradas cargadas, vamos a comprobar si tenemos un permalink a una parada.

		p = L.UrlUtil.queryParse(L.UrlUtil.hash());
		if (typeof(p.parada) != "undefined")
		{
			centrar_y_desplegar_parada(p.parada);
			return;
		}
		else if (typeof(p.linea) != "undefined")
		{
			mostrar_mapa_linea(p.linea);
			return;
		}

		// Mostramos todas las paradas aquí y no antes - si hay un permalink a una parada, se va a reencuadrar el mapa, y es una estupidez mostrar las paradas ahora para reencuadrarlo unos instantes después.
		mostrar_paradas();

	});


	// Pues eso, centra la vista en una parada (a zoom 18) y abre el pop-up correspondiente.
	centrar_y_desplegar_parada = function( parada )
	{
		// Hay veces que esto se llama desde un overlay, así que hay que ocultarlo para ver el mapa y los popups.
		$('#overlay').hide();
		$('#overlay-background').hide();
		$('.leaflet-control').show();


		for (i=0; i<paradas.length; i++)
		{
			if (paradas[i].ref == parada)
			{
				// Si existe la parada a la que hace referencia el permalink, reencuadro sin cargar las paradas automáticamente (desactivo y reactivo los eventos), para justo después llamar a mostrar_paradas() con el número de parada que tiene que desplegar automáticamente.

				map.off('moveend', mostrar_paradas );
				map.setView([paradas[i].lat, paradas[i].lon], 18);

				// Espeeera un momentito. Si centramos la parada, no se va a ver bien en dispositivos móviles. ¿Qué tal si la dejamos a 3/4 de altura, para que se vea más popup?
				setTimeout( function(){
					var y = window.innerHeight * 0.25;
					var x = window.innerWidth * 0.5;
					map.setView( map.containerPointToLatLng( new L.Point(x,y,true) ) , 18);

					setTimeout( function(){
						mostrar_paradas( parada );
						map.on('moveend', mostrar_paradas );
					}, 500);
				}, 500);
				return true;;
			}
		}
		return false;
	}



	// Dibujar todas las paradas que hay dentro del encuadre.
	// Opcionalmente, desplegar el popup de la parada con la ref especificada.
	function mostrar_paradas( desplegar_parada )
	{

		var b = map.getBounds();

		var minlat = b._southWest.lat;
		var minlon = b._southWest.lng;
		var maxlat = b._northEast.lat;
		var maxlon = b._northEast.lng;

		var dentro = 0;

		// Primero borramos los marcadores visibles
		for (i=0; i<marcadores.length; i++)
		{
			map.removeLayer(marcadores[i]);
		}



		for (i=0; i<paradas.length; i++)
		{
			if (paradas[i].lat > minlat &&
			    paradas[i].lat < maxlat &&
			    paradas[i].lon > minlon &&
			    paradas[i].lon < maxlon)
			{
				dentro += 1;
				// Nunca mostrar más de 50 paradas
				if (dentro > 50)
				{
					$('#zoomtip').html("Haga zoom para ver paradas").removeClass('clickable');
					return;
				}
			}

		}

		$('#zoomtip').html("Ver buses de " + dentro + " paradas").click( buscar_varias_paradas ).addClass('clickable');


		for (i=0; i<paradas.length; i++)
		{
			if (paradas[i].lat > minlat &&
			    paradas[i].lat < maxlat &&
			    paradas[i].lon > minlon &&
			    paradas[i].lon < maxlon)
			{

				var ref_parada = paradas[i].ref;
				var icono;

				try
				{
					if (typeof paradas_con_incidencia[ref_parada] == 'object')
					{
	// 					console.log(paradas_con_incidencia[ref_parada]);
						icono = '../img/icono-aviso.png';
	// 					icono = 'img/icono-incidencia.png';
					}
					else
						icono = '../img/icono-normal.png';
	// 					icono = 'img/circle2-blue.png';
				}
				catch(e)	// No mostrar incidencias si todavía no hemos cargado el array de incidencias
				{
					icono = '../img/icono-normal.png';
				}

				var marker = L.marker([paradas[i].lat,paradas[i].lon], {icon: L.icon(
					{
					iconUrl: icono,
	// 				shadowUrl:null,
					iconSize:[16,16],
					iconAnchor:[8,8],
					popupAnchor:[0,-8]
					}
				)
				, id_parada:paradas[i].ref
				, nombre_parada:paradas[i].nombre
				});

				marcadores.push(marker);

				marker.addTo(map);

				marker.bindPopup(paradas[i].nombre + " (" + paradas[i].ref + ")" , {id_parada:paradas[i].ref, nombre_parada:paradas[i].nombre, minWidth:150, autoPan: false} );


				// Para permalinks a paradas
				if (paradas[i].ref == desplegar_parada)
					marker.openPopup();

			}
		}
	}




	// La idea es que al pulsar el "Ver buses de N paradas" se cargue un overlay que muestre los tiempos de todos los autobuses que pasan cerca (en alguna parada del encuadre)
	buscar_varias_paradas = function( refrescar )
	{
		var b = map.getBounds();

		var minlat = b._southWest.lat;
		var minlon = b._southWest.lng;
		var maxlat = b._northEast.lat;
		var maxlon = b._northEast.lng;

		var query_string = "";

		var dentro = 0;

		for (i=0; i<paradas.length; i++)
		{
// 			console.log(minlon,paradas[i].lon,maxlon, minlat,paradas[i].lat, maxlat);

			if (paradas[i].lat > minlat &&
			    paradas[i].lat < maxlat &&
			    paradas[i].lon > minlon &&
			    paradas[i].lon < maxlon)
			{
				query_string += "ids_parada[" + dentro + "]=" + paradas[i].ref + "&";
				dentro += 1;
			}

		}

// 		console.log(query_string);

		if (refrescar == true)
		{
			$('#actualizar_todos_buses').html('Actualizando...').removeClass('clickable');
		}
		else
		{
			$('#overlay').show().html("<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();\" class='clickable backbutton'>Volver al mapa</span></div><h2>Consultando todos los autobuses en la zona...</h2>");

			$('#overlay-background').show();
		}

		$('.leaflet-control').hide();


		$.ajax({
			// Lanzamos la petición para obtener el JSON con los tiempos. Se incluye el tiempo actual (época unix) para evitar cachés y todo ese rollo.
			url: "tiempos.php?t=" + (new Date().getTime()) + "&" + query_string,
		}).done(function( data ) {

			var texto = "<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();\" class='clickable backbutton'>Volver al mapa</span> <span id='actualizar_todos_buses' onclick='buscar_varias_paradas(true)' class='clickable backbutton'>Actualizar</span></div><p>";


			if (data.Error)
			{
				texto += "Hubo un error recuperando los datos de la EMT. <a href='http://www.twitter.com/home?Status=@EMTmadrid%20Me%20ha%20dejado%20de%20funcionar%20www.cuantotardamiautobus.es%2C%20%BFpodr%EDais%20arreglar%20vuestra%20plataforma%20SOA%2C%20por%20favor?'>Dile a @EMTmadrid que lo arreglen</a>.";
			}
			else if (!data.length)
			{
				texto += "Actualmente no pasan autobuses por la zona.</p>";
			}
			else
			{
				texto += "<table class='timetable'><tr><td>Parada</td><td>Línea</td><td>Destino</td><td>Tiempo</td></tr>";
				for (i=0; i<data.length; i++)
				{
					var minutos  = Math.floor(data[i].segundos / 60);
					var segundos = data[i].segundos % 60;
					if (segundos < 10)
						segundos = "0" + segundos;

					var tiempo = minutos + ":" + segundos;
					if (data[i].segundos == 999999)
						tiempo = "20+";

					texto += "<tr><td class='numero'><span class='clickable' onclick='centrar_y_desplegar_parada(" + data[i].parada + ");'>" + data[i].parada + "</span>" +
					         "</td><td class='numero'><span class='clickable' onclick='mostrar_mapa_linea(\"" + data[i].linea + "\");'>" + data[i].linea +
					         "</td><td class='destino'>" + data[i].destino +
					         "</td><td class='numero countdown'>" + tiempo +
					         "</td></tr>";
				}
				texto += "</table></p>";
			}

			$('#overlay').html(texto);
		});


	}



	// Cada vez que el mapa se mueva por lo que sea (este evento también incluye zoom y encuadre a GPS), recargar las paradas.
	map.on('moveend', mostrar_paradas );


	map.on('popupopen', function(e) {
// 		e.popup._content = "Cargando tiempos de autobuses a parada " + e.popup.options.id_parada + "...";
// 		e.popup._content = "Consultando autobuses...";
		e.popup._contentNode.innerHTML = "Consultando autobuses...";


		// Una pista para el permalink de esta parada
		window.location.hash = "parada=" + e.popup.options.id_parada;

		id_parada_mostrada    = e.popup.options.id_parada;
		nombre_linea_mostrada = e.popup.options.nombre_parada;

		$.ajax({
			// Lanzamos la petición para obtener el JSON con los tiempos. Se incluye el tiempo actual (época unix) para evitar cachés y todo ese rollo.
			url: "tiempos.php?t=" + (new Date().getTime()) + "&ids_parada[0]=" + e.popup.options.id_parada,
		}).done(function( data ) {

			cargar_datos_parada(data);

		});
	});


	map.on('popupclose', function(e) {
		// Quitamos la pista del permalink de parada cuando se cierra
		window.location.hash = "";

		// Evitar que se recargue el tiempo cada 30 segundos
		id_parada_mostrada = undefined;
	});


	// Recargar la línea entera cada 30 segundos
	setInterval( function() {
		if (typeof(id_parada_mostrada) != 'undefined')
			tiempos_mapa_linea();
	}, 30000);


	// Recargar la parada cada 30 segundos
	setInterval( function() {
		if (typeof(id_parada_mostrada) != 'undefined')
			$.ajax({
				// Lanzamos la petición para obtener el JSON con los tiempos. Se incluye el tiempo actual (época unix) para evitar cachés y todo ese rollo.
				url: "tiempos.php?t=" + (new Date().getTime()) + "&ids_parada[0]=" + id_parada_mostrada,
			}).done(function( data ) {

				cargar_datos_parada(data);

			});
	}, 30000);






	cargar_datos_parada = function(data)
	{
		var texto = "";

		if (data.Error)
		{
			texto += "Hubo un error recuperando los datos de la EMT. <a href='https://twitter.com/intent/tweet?text=@EMTmadrid%20Me%20ha%20dejado%20de%20funcionar%20www.cuantotardamiautobus.es,%20%C2%BFpodr%C3%ADais%20arreglar%20vuestra%20plataforma%20SOA,%20por%20favor?' target='_blank'>Dile a @EMTmadrid que lo arreglen</a>.";
		}
		else if (!data.length)
		{
			texto = "Actualmente no pasan autobuses por " + nombre_linea_mostrada + " (" + id_parada_mostrada + ")";
		}
		else
		{
			texto = "Autobuses que pasan por " + nombre_linea_mostrada + " (" + id_parada_mostrada + "):<table class='timetable'><tr><th>Línea</th><th>Destino</th><th>Tiempo</th></tr>";

			for (i=0; i<data.length; i++)
			{
				var minutos  = Math.floor(data[i].segundos / 60);
				var segundos = data[i].segundos % 60;
				var countdown_class = 'countdown';	// Se asigna una clase CSS a las celdas que contienen un tiempo, para meterle una cuenta atrás con un SetInterval.
				if (segundos < 1)
					segundos = "0" + segundos;

				var tiempo = minutos + ":" + segundos;
				if (data[i].segundos == 999999)
				{
					tiempo = "20+";
					countdown_class = '';
				}
				else if (data[i].segundos <= 0)
				{
					countdown_class = '';
				}

				texto += "<tr><td class='numero'><span class='clickable' onclick='mostrar_mapa_linea(\"" + data[i].linea + "\");'>" + data[i].linea +
				         "</td><td class='destino'>" + data[i].destino +
				         "</td><td class='numero " + countdown_class + "'>" + tiempo +
				         "</td></tr>";
			}
			texto += "</table>";
		}

		try
		{
			if (typeof paradas_con_incidencia[id_parada_mostrada] == 'object')
			{
	// 				console.log(paradas_con_incidencia[id_parada_mostrada]);

				var lineas_con_incidencia = paradas_con_incidencia[id_parada_mostrada].lin;
				var incidencias_en_parada = paradas_con_incidencia[id_parada_mostrada].inc;

				texto += "<div class='clickable' onclick='mostrar_incidencias("
				         + id_parada_mostrada + ", ["
					 + incidencias_en_parada.join(",")
					 + "]);'>Incidencias en línea "
					 + lineas_con_incidencia.join(", ") + "</div>";
			}
		}
		catch (ex) // No mostrar incidencias si todavía no hemos cargado el array de incidencias
		{
			/// FIXME: evento al cargar el array de incidencias para disparar esto de nuevo, o algún tipo de espera.
		}

		// Después de las incidencias (si las hay), mostrar enlace a generar QR, pero sólo si estamos en una pantalla "grande"
		if (window.outerWidth > 600)
		{
			texto += "<div class='clickable' onclick='window.location = \"http://www.cuantotardamiautobus.es/createqr.php?ciudad=madrid&parada="
			+ id_parada_mostrada + "\";'>Crear código QR</div>";

			$('.leaflet-popup-content').html(texto);
		}
		else
		{
			$('#overlay').empty();
			$('#overlay').html("<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show(); id_parada_mostrada = undefined;\" class='clickable backbutton'>Volver al mapa</span></div>" + texto);
			$('#overlay-background').show();
			$('#overlay').show();
			$('.leaflet-control').hide();

			// Se cierra el popup del mapa, y se vuelve a poner el hash (que se ha quitado al cerrar el popup)
			id_temp = id_parada_mostrada;
			map.closePopup();
			id_parada_mostrada = id_temp;
			window.location.hash = "parada=" + id_parada_mostrada;
		}
	};





	setInterval( function(data) {

		$('.countdown').each( function(i) {

			var tiempo = this.innerHTML;

			posicion_separador = tiempo.search(":");
			var minutos = parseInt(tiempo.slice(0,posicion_separador));
			var segundos = parseInt(tiempo.slice(posicion_separador+1));

			segundos += minutos * 60;

			segundos -= 1;

			if (segundos <= 0)
			{
// 				this.className = "numero";	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
				$(this).removeClass('countdown');	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
				this.innerHTML = "0:00";
			}
			else if (minutos >= 20 || isNaN(segundos) || isNaN(minutos))	// Vamos a evitar que la gente vea un NaN:NaN...
			{
// 				this.className = "numero";	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
				$(this).removeClass('countdown');	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
			}
			else
			{
				minutos = Math.floor(segundos / 60);
				segundos = segundos % 60;
				if (segundos < 10)
					segundos = "0" + segundos;

				this.innerHTML = minutos + ":" + segundos;
			}

		} );


	} , 1075);	// Esto es muy, muy evil.




	// Llena el overlay con info larga de las incidencias especificadas.
	mostrar_incidencias = function (parada, incidencias_en_parada)
	{
		var texto = "<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();\" class='clickable backbutton'>Volver al mapa</span></div>";

		for (i=0; i<paradas.length; i++)
		{
			if (paradas[i].ref == parada)
			{
				texto += "<h2>Incidencias en " + paradas[i].nombre + " (" + parada + ")</h2>"
			}
		}

		for (i=0; i<incidencias_en_parada.length; i++)
		{
			var incidencia = incidencias[incidencias_en_parada[i]];

			texto += "<h3>" + incidencia.titulo + "</h3>" +
			         "<p> Desde "  + incidencia.rssAfectaDesde2  +
			         " hasta "  + incidencia.rssAfectaHasta2  + "</p>" +
			         "<p>" + incidencia.descripcion + "</p>" +
			         "<p>Más información: <a href='" + incidencia.link + "' target='_blank'>" + incidencia.link + "</a></p>";

		}



		$('#overlay').show().html(texto);
		$('#overlay-background').show();
		$('.leaflet-control').hide();
	}



	// Llena el overlay con el formulario de buscar (paradas, calles)
	mostrar_buscar = function()
	{
		var texto = "<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();\" class='clickable backbutton'>Volver al mapa</span></div>";

		texto += "<p>Introduzca un número de parada o el nombre completo de una calle o lugar:</p>";

		texto += "<p><form><input type='text' id='input_busqueda'><span onclick=\"buscar();\" class='clickable backbutton' id='boton_buscar'>Buscar</span></p>";

		texto += "<p><ul id='resultados_nomenclator'></ul></p>";


		$('#overlay').html(texto);

		// Enfocar al campo de texto, y hacer que busque si se pulsa enter (en vez de intentar enviar el formulario)
		$('#input_busqueda').focus().keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				buscar();
				return false;
				}
		});

	}


	// Llamada al nomenclator
	buscar = function()
	{
// 		console.log( $('#input_busqueda').val() );

		$('#boton_buscar').html('Buscando...').removeClass('clickable');

		var parada = parseInt( $('#input_busqueda').val() );

		if (!isNaN ( parada ) )
		{
			centrar_y_desplegar_parada( parada );
		}
		else	// Tirar de la API de nominatim
		{
			$.ajax({
				// Lanzamos la petición para obtener el JSON con los tiempos. Se incluye el tiempo actual (época unix) para evitar cachés y todo ese rollo.
				url: "nomenclator.php?q=" + $('#input_busqueda').val()
			}).done(function( data ) {

				$('#resultados_nomenclator').html('');

				for (i in data) {

					item = data[i];

					var lat; var lon;
					lat = item.lat;
					lon = item.lon;

					$('#resultados_nomenclator').append( $("<li onclick=\"" +
					"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show();" +
					"map.setView([" + item.lat + "," + item.lon + "], 16);\">"
					+ item.display_name + '</li>').addClass('clickable') );

				};

			});

		}


	}


 });

