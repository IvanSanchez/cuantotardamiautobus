cuantotardamiautobus
====================
El código detrás de www.cuantotardamiautobus.es, ahora bajo GPL.


Licencia
=============
Este código está bajo licencia GPL. Puede encontrarse el texto completo en el fichero COPYING.txt.

El repositorio git incluye el código de jQuery (bajo licencia MIT, véase https://jquery.org/license/) y leaflet (véase https://github.com/Leaflet/Leaflet/blob/master/LICENSE) por comodidad.

También se incluyen iconos de Wikimedia Commons, bajo dominio público. Véase https://en.wikipedia.org/wiki/Wikipedia:Route_diagram_template/Catalog_of_pictograms



Instalación
=============
El código debería funcionar en cualquier apache con soporte para PHP y SQLite. Establecer el directorio src/ como base del virtualhost, y dejar ../BDD/ como está, habiendo creado una BDD de SQLite vacía llamada cuantotardamiautobus-madrid.sqlite, con el esquema de tablas indicado.

Para que funcione correctamente, hay que pedir a la EMT de Madrid una clave para su API y editar auth.php.init, dejando la versión con el identificador de cliente y clave en otro fichero llamado auth.php. Nunca subir este fichero a ningún repo.

No se incluyen los scripts que transforman el GTFS en ficheros JSON resumidos.

