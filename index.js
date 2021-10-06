mapboxgl.accessToken = 'pk.eyJ1IjoianVsaWFuLWF6YW5nZSIsImEiOiJja3VleGFnMnIwazhjMnVwaHVwcW1odjQxIn0.K38cvNw0fGI5B3oPZ_fYSg'; // Token generado por mapbox

var map = new mapboxgl.Map({
	container: 'map', // map del html
	style: 'mapbox://styles/mapbox/navigation-night-v1', // estilos de mapbox
	center: [-74.082412, 4.639386], // ubicacion del mapa apenas se inicie en el visor
	zoom: 5
});

document
	.getElementById('listing-group')
	.addEventListener('change', function (e) {
		var handler = e.target.id;
		if (e.target.checked) {
			map[handler].enable();
		} else {
			map[handler].disable();
		}
	});
/* Se definen algunos lugares para representarlos e identificarlos */
var customData = {
	'features': [
		{
			'type': 'Feature',
			'properties': {
				'title': 'Universidad de la Amazonia'
			},
			'geometry': {
				'coordinates': [-75.6042556026793, 1.6203629388443823],
				'type': 'Point'
			}
		},
	],
	'type': 'FeatureCollection'
};

function forwardGeocoder(query) {
	var matchingFeatures = [];
	for (var i = 0; i < customData.features.length; i++) {
		var feature = customData.features[i];
		// Handle queries with different capitalization
		// than the source data by calling toLowerCase().
		if (
			feature.properties.title
				.toLowerCase()
				.search(query.toLowerCase()) !== -1
		) {
			// Add a tree emoji as a prefix for custom
			// data results using carmen geojson format:
			// https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
			feature['place_name'] = '🎓' + feature.properties.title;
			feature['center'] = feature.geometry.coordinates;
			feature['place_type'] = ['park'];
			matchingFeatures.push(feature);
		}
	}
	return matchingFeatures;
}

// Add the control to the map.
map.addControl(
	new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		localGeocoder: forwardGeocoder,
		zoom: 14,
		placeholder: 'Buscar lugar',
		mapboxgl: mapboxgl
	})
);


// Agregar rutas
map.addControl(
	new MapboxDirections({
		accessToken: mapboxgl.accessToken,
		language: "es",
	}),
	"top-left"
);

// Agregar barra de zoom
map.addControl(new mapboxgl.NavigationControl());

// Edificios en 3D

map.on("load", () => {

	const layers = map.getStyle().layers;
	const labelLayerId = layers.find(
		(layer) => layer.type === "symbol" && layer.layout["text-field"]
	).id;

	map.addLayer(
		{
			id: "add-3d-buildings",
			source: "composite",
			"source-layer": "building",
			filter: ["==", "extrude", "true"],
			type: "fill-extrusion",
			minzoom: 15,
			paint: {
				"fill-extrusion-color": "#aaa",
				"fill-extrusion-height": [
					"interpolate",
					["linear"],
					["zoom"],
					15,
					0,
					15.05,
					["get", "height"],
				],
				"fill-extrusion-base": [
					"interpolate",
					["linear"],
					["zoom"],
					15,
					0,
					15.05,
					["get", "min_height"],
				],
				"fill-extrusion-opacity": 0.6,
			},
		},
		labelLayerId
	);
});
