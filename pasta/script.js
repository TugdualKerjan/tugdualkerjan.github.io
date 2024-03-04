// Define global variables for the map, vector source, and pasta-country mapping
let map, vectorSource, vectorLayer;
const pastaCountries = {
    "spaghetti": ["ITA", "USA", "FRA"],
    "penne": ["ITA", "ESP", "BRA"],
    // Add more mappings as needed
};

// Initialize the map and layers
function initMap() {
    // Define the raster layer
    const rasterLayer = new ol.layer.Tile({
        source: new ol.source.OSM(),
    });

    // Initialize the vector source without URL, to be set dynamically
    vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        // The URL will be set based on pasta selection
    });

    // Initialize the vector layer with the source
    vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        // Define default style for vector layer
        style: defaultStyle,
    });

    // Create the map
    map = new ol.Map({
        target: 'map',
        layers: [rasterLayer, vectorLayer],
        view: new ol.View({
            center: ol.proj.fromLonLat([12, 42]), // Center around Italy for example
            zoom: 3,
        }),
    });

    highlightCountries("penne")
}

// Define the highlight style
const highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 0, 0.6)', // Bright yellow
    }),
    stroke: new ol.style.Stroke({
        color: 'darkblue', // Dark blue border
        width: 3,
    }),
});

// Define the default style
const defaultStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(200, 200, 200, 0.6)', // Light gray
    }),
    stroke: new ol.style.Stroke({
        color: '#000', // Black border
        width: 1,
    }),
});

// Function to highlight countries based on pasta selection
function highlightCountries(pasta) {
    const countries = pastaCountries[pasta] || [];
    vectorSource.clear(); // Clear existing features
    loadGeoJson(countries); // Load and style GeoJSON based on selected pasta
}

// Load GeoJSON and apply styles dynamically
function loadGeoJson(highlightedCountries) {
    fetch('https://raw.githubusercontent.com/openlayers/ol3/6838fdd4c94fe80f1a3c98ca92f84cf1454e232a/examples/data/geojson/countries.geojson') // Adjust the path to your GeoJSON file
        .then((response) => response.json())
        .then((data) => {
            const features = new ol.format.GeoJSON().readFeatures(data, {
                featureProjection: 'EPSG:3857',
            });
            vectorSource.addFeatures(features);
            // Apply styles
            vectorSource.forEachFeature((feature) => {
                const countryId = feature.getId();
                feature.setStyle(highlightedCountries.includes(countryId) ? highlightStyle : defaultStyle);
            });
        });
}

// Event listener for pasta selection
document.getElementById('pastaSelector').addEventListener('change', function () {
    highlightCountries(this.value);
});

// Initialize the map on load
window.onload = initMap;