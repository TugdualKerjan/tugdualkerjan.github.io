// Define global variables for the map, vector source, and pasta-country mapping
let map, vectorSource, vectorLayer;
var pastaCountries = {};
let geoJsonFeatures = [];

// Initialize the map and layers
function initMapAndList() {
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

    fetch('https://raw.githubusercontent.com/openlayers/ol3/6838fdd4c94fe80f1a3c98ca92f84cf1454e232a/examples/data/geojson/countries.geojson') // Adjust the path to your GeoJSON file
        .then((response) => response.json())
        .then((data) => {
            // Read and store the features
            geoJsonFeatures = new ol.format.GeoJSON().readFeatures(data, {
                featureProjection: 'EPSG:3857',
            });

            // Add the features to the source
            vectorSource.addFeatures(geoJsonFeatures);
        })
        .catch(error => console.error('Error fetching GeoJSON data:', error));


    fetch('pasta_data.json')
        .then(response => response.json())
        .then(pastaData => {
            loadPasta(pastaData)
        })
        .catch(error => {
            console.error('Error fetching pasta data:', error);
        });
}

function loadPasta(pastaData) {
    // Clear previous list
    document.querySelector('.scrollable-list').innerHTML = '';

    // Build the pastaCountries mapping and create list items
    pastaData.forEach(pasta => {
        // Store country codes for each pasta
        pastaCountries[pasta.name] = Object.keys(pasta.links);

        // Create list item for each pasta
        let listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.addEventListener('click', () => {
            selectItem(pasta.name, pasta.image, pasta.number, listItem);
        });

        let img = document.createElement('img');
        img.src = pasta.image;
        img.alt = pasta.name;
        img.className = 'pasta-image';

        let text = document.createTextNode(` ${pasta.name}`);
        listItem.appendChild(img);
        listItem.appendChild(text);

        document.querySelector('.scrollable-list').appendChild(listItem);
    });

    //Select the first element

    const firstItem = document.querySelector('.list-item').firstChild;
    firstItem.click(); // Programmatically click the first item
}

function selectItem(name, imagePath, number, listItem) {
    // Update the image displayed on the webpage to the selected pasta's image
    // Clear previously selected item styling
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('selected-list-item');
    });

    // Set the clicked item as selected
    listItem.classList.add('selected-list-item');

    // Update the image displayed on the webpage to the selected pasta's image
    document.querySelector('.current-pasta').src = imagePath;
    document.querySelector('.current-pasta').alt = `Image of ${name}`;

    // Update the number display
    const pastaNumberDisplay = document.getElementById('pastaNumberDisplay');
    pastaNumberDisplay.textContent = `${name}, Number: ${number}`;
    pastaNumberDisplay.style.display = 'block'; // Make sure it's visible

    // Highlight the countries on the map where this pasta is available
    highlightCountries(name);
}


function highlightCountries(pastaName) {
    const countries = pastaCountries[pastaName] || [];
    vectorSource.clear(); // Clear existing features
    loadGeoJson(countries); // Load and style GeoJSON based on selected pasta
}

// Define the highlight style
const highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(178, 10, 48, 0.6)', // Bright yellow
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(13, 38, 79, 0.6)', // Dark blue border
        width: 1,
    }),
});

// Define the default style
const defaultStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(200, 200, 200, 0.0)', // Light gray
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(200, 200, 200, 0.0)', // Black border
        width: 1,
    }),
});

// // Function to highlight countries based on pasta selection
// function highlightCountries(pasta) {
//     const countries = pastaCountries[pasta] || [];
//     vectorSource.clear(); // Clear existing features
//     loadGeoJson(countries); // Load and style GeoJSON based on selected pasta
// }

function highlightCountries(pastaName) {
    const countriesToHighlight = pastaCountries[pastaName] || [];

    // Apply the highlight style to the features that match the selected pasta's countries
    geoJsonFeatures.forEach((feature) => {
        const countryId = feature.getId();
        feature.setStyle(countriesToHighlight.includes(countryId) ? highlightStyle : defaultStyle);
    });
}

// Initialize the map on load
window.onload = initMapAndList;

document.addEventListener("DOMContentLoaded", () => {
    const statElements = document.querySelectorAll(".stat h2");

    statElements.forEach((element) => {
        const targetNumber = parseInt(element.textContent, 10);
        const duration = 2000; // Duration of the animation in milliseconds
        const stepTime = 10; // Time between each step in milliseconds
        let currentNumber = 0;

        const stepIncrement = targetNumber / (duration / stepTime);

        const interval = setInterval(() => {
            currentNumber += stepIncrement;
            if (currentNumber > targetNumber) {
                currentNumber = targetNumber; // Ensure it doesn't go over the target
                clearInterval(interval); // Stop the interval
            }
            element.textContent = Math.floor(currentNumber).toLocaleString(); // Update the text
        }, stepTime);
    });
});
