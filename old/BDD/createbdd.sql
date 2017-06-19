create table tiempos
(linea   	varchar(8)
,parada  	int
,timestamp 	datetime
,distancia 	int
,espera  	int

,primary key (linea,parada,timestamp)
);



create table lineas_paradas
(linea   	varchar(8)
,parada  	int
,sentido 	int
,distancia 	int

,timestamp 	datetime

,primary key (linea,parada,sentido)
);



create table paradas
(parada  	int
,nombre 	varchar(255)
,utm_x  	float
,utm_y  	float

,primary key (parada)
);





-- select
-- 	l.linea, l.distancia+t.distancia as distancia, l.distancia as distl, t.distancia as distt, espera, t.timestamp
-- from
-- 	lineas_paradas l, tiempos t
-- where
-- 	l.linea='99'
-- 	and t.linea=l.linea
-- order by
-- 	t.timestamp asc,
-- 	distancia asc;
--
--
--
--
--
-- select l.linea, l.distancia+t.distancia as distancia, l.distancia as distl, t.distancia as distt, espera, t.timestamp from lineas_paradas l, tiempos t where l.linea='99' and t.linea=l.linea and sentido=1 order by t.timestamp asc, distancia asc;




