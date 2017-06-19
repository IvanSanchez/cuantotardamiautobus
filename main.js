

// Map stuff

var map = L.map('map').setView([40.416, -3.703], 13);

var layer = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Imagery courtesy <a href="http://www.thunderforest.com/">Andy Allan</a>', maxZoom: 18, prefix:false
}).addTo(map);

if (!window.location.hash.slice(1))
	map.locate({setView: true, maxZoom: 18});	// Sólo activar la geolocalización cuando no me pasen un permalink.

// map.addControl(new L.Control.Permalink({text: 'Permalink', layers: [layer]}));
map.attributionControl.setPrefix(false);


function onLocationFound(e) {
	var radius = e.accuracy / 2;

// 		L.marker(e.latlng).addTo(map)
// 			.bindPopup("You are within " + radius + " meters from this point").openPopup();

	map.setView(e.latlng,17);

// 		L.circle(e.latlng, radius, {fillOpacity: 0 } ).addTo(map);
}



// A wrapper to fetch stuff from the EMT API.
// Returns a Promise to a set of data, based on the Fetch API. This means
// that rejections will happen the same as Fetch.
function fetchEmt(endpoint, params) {
	params = params || {};

	var server = 'https://openbus.emtmadrid.es:9443/emt-proxy-server/last/';

	var idClient = "WEB.SERV.dumbstumpy@mailinator.com";
	var passKey = "C513925F-1DBE-441C-B6C8-716E55E0C0A1";

	var formdata = new FormData();
	formdata.append( "idClient", idClient );
	formdata.append( "passKey", passKey );

	for (var i in params) {
		formdata.append(i, params[i]);
	}

	return fetch(server + endpoint, {
		method: "POST",
		body: formdata
	})
	.then(function(res){ return res.json(); })
	.then(function(data){
		if ('resultCode' in data) {
			if (data.resultCode === 0) {
				return data.resultValues;
			} else {
				return Promise.reject(data.resultCode + ' ' + data.resultDescription);
			}
		}

		return data;
	})
}

var stopsGroup = L.featureGroup().addTo(map);
var iconNoWarn = L.icon({iconUrl: 'img/icono-normal.png', shadowUrl: false, iconSize: [16, 16], iconAnchor: [8, 8]})
// var iconWarn = L.icon({iconUrl: 'img/icono-aviso.png', shadowUrl: false, iconSize: [16, 16], iconAnchor: [8, 8]})
// var iconWarn = L.icon({});

var stopsData = [];
var stopMarkers = [];

fetchEmt('/bus/GetNodesLines.php', {}).then(function(data){
	stopsData = data;

	for (var i=0, l=data.length; i<l; i++) {
		var marker = L.marker([data[i].latitude, data[i].longitude], {icon: iconNoWarn});
		marker.on('click', onStopClick(data[i]));
// 		stopsGroup.addLayer(marker);
		stopMarkers.push(marker);
	}

	displayStops();
});

map.on('zoomend moveend', displayStops);


// Loop through the stops and check if < 50 inside the screen viewport
function displayStops() {
	/// TODO: Use a rbush instead
	var mapBounds = map.getBounds();
	stopsGroup.remove().clearLayers();
	var inside = 0;

	for (var i=0,l=stopMarkers.length; i<l; i++) {
		if (mapBounds.contains(stopMarkers[i].getLatLng())){
			inside++;
			stopsGroup.addLayer(stopMarkers[i]);

			if (inside > 50) {
				$('#zoomtip').html("Haga zoom para ver paradas").removeClass('clickable');
				return;
			}
		}
	}

	stopsGroup.addTo(map);
	console.log(inside);

	// FIXME!!!
// 	$('#zoomtip').html("Ver buses de " + inside + " paradas")/*.click( buscar_varias_paradas )*/.addClass('clickable');
	$('#zoomtip').html("");


}


var currentStopId;
var currentStopName;
var currentPopup;

// Event handler for the marke click
function onStopClick(stopData) {
	return function(ev) {
		map.closePopup();
		currentPopup = L.popup().setLatLng(ev.target.getLatLng());

		currentPopup.setContent('<p>Solicitando tiempos de llegada para ' + stopData.name + ' - ' + stopData.node + '</p>')
		currentPopup.openOn(map);

// 		map.openPopup(stopData.name + ' - ' + stopData.node, ev.target.getLatLng());
// 		ev.target.bindPopup().openPopup();

		currentStopId   = stopData.node;
		currentStopName = stopData.name;
		queryAndDisplayArrivals(currentStopId);
	}
}



function queryAndDisplayArrivals(stopId) {
	fetchEmt('/geo/GetArriveStop.php', { idStop: stopId }).then(function(data){
// 		console.log(data);
		var text;

		if (!data.arrives.length) {
			text = "Actualmente no pasan autobuses por " + currentStopName  + " (" + currentStopId + ")";
		} else {
			text = "Autobuses que pasan por " + currentStopName + " (" + currentStopId + "):<table class='timetable'><tr><th>Línea</th><th>Destino</th><th>Tiempo</th></tr>";
			var arrivals = data.arrives;

			for (var i=0,l=arrivals.length; i<l; i++) {
				var arrival = arrivals[i];

				// Prevent displaying arrivals in case of race conditions
				if (currentStopId !== arrival.stopId) { return; }

				var minutes  = Math.floor(arrival.busTimeLeft / 60);
				var seconds = arrival.busTimeLeft % 60;
				var countdown_class = 'countdown';	// Se asigna una clase CSS a las celdas que contienen un tiempo, para meterle una cuenta atrás con un SetInterval.
				if (seconds < 10)
					seconds = "0" + seconds;

				var time = minutes + ":" + seconds;
				if (arrival.busTimeLeft == 999999) {
					time = "20+";
					countdown_class = '';
				} else if (arrival.busTimeLeft <= 0) {
					countdown_class = '';
				}

				// 					text += "<tr><td class='numero'><span class='clickable' onclick='mostrar_mapa_linea(\"" + data[i].linea + "\");'>" + data[i].linea +
				text += "<tr><td class='numero'><span>" + arrival.lineId +
				"</td><td class='destino'>" + arrival.destination +
				"</td><td class='numero " + countdown_class + "'>" + time +
				"</td></tr>";
			}
			text += "</table>";



			if (window.outerWidth > 600) {
				// 					text += "<div class='clickable' onclick='window.location = \"http://www.cuantotardamiautobus.es/createqr.php?ciudad=madrid&parada="
				// 					+ currentStopId + "\";'>Crear código QR</div>";

// 				$('.leaflet-popup-content').html(text);
				currentPopup.setContent(text);
			} else {
				$('#overlay').empty();
				$('#overlay').html("<div><span onclick=\"$('#overlay').hide(); $('#overlay-background').hide(); $('.leaflet-control').show(); currentStopId = undefined;\" class='clickable backbutton'>Volver al mapa</span></div>" + text);
				$('#overlay-background').show();
				$('#overlay').show();
				$('.leaflet-control').hide();

				// Se cierra el popup del mapa, y se vuelve a poner el hash (que se ha quitado al cerrar el popup)
				tempId = currentStopId;
				map.closePopup();
				currentStopId = tempId;
			}
			window.location.hash = "parada=" + currentStopId;
		}
	});
}


map.on('popupclose', function(){
	window.location.hash = '';
})



setInterval( function(data) {
	$('.countdown').each( function(i) {
		var time = this.innerHTML;

		separatorPosition = time.search(":");
		var minutes = parseInt(time.slice(0,separatorPosition));
		var seconds = parseInt(time.slice(separatorPosition+1));

		seconds += minutes * 60;

		seconds -= 1;

		if (seconds <= 0) {
// 				this.className = "numero";	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
			$(this).removeClass('countdown');	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
			this.innerHTML = "0:00";
		} else if (minutes >= 20 || isNaN(seconds) || isNaN(minutes)) {	// Vamos a evitar que la gente vea un NaN:NaN...
// 				this.className = "numero";	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
			$(this).removeClass('countdown');	// Quitar la clase "countdown" == la cuenta atrás no se ejecutará para esta celda
		} else {
			minutes = Math.floor(seconds / 60);
			seconds = seconds % 60;
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			this.innerHTML = minutes + ":" + seconds;
		}
	} );
} , 1075);	// This is very, very evil.



