// ─────────────────────────────────────────────────────────────────────────
// EATEN LIST — the pasta numbers Tugdual has already eaten.
// Edit this one short list to update what shows in colour vs. grayed out.
// (Numbers correspond to the "number" field of each pasta.)
const EATEN = [
    "5", "10", "13", "27", "44", "49", "54", "56", "59", "65",
    "83", "88", "90", "93", "98", "217", "265", "280", "292", "296",
    // discovered extras (no classic pack number, keyed by slug)
    "297", "piccolini", "gran-ruote", "trigatelli", "amore"
];
const eatenSet = new Set(EATEN.map(String));

// PASTA META — optional tasting notes + rating per pasta number.
// Add entries as you eat them, e.g.  "0": { rating: 4, description: "..." }
// rating is 0–5; description is free text. Missing fields show a placeholder.
const PASTA_META = {
    // "0": { rating: 4, description: "Thin, cooks in a flash — great in broth." },
};
// ─────────────────────────────────────────────────────────────────────────

// Define global variables for the map, vector source, and pasta-country mapping
let map, vectorSource, vectorLayer;
var pastaCountries = {};
let geoJsonFeatures = [];

// Gallery state
let allPasta = [];
let currentIndex = 0;

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


    fetch('./pasta_data.json')
        .then(response => response.json())
        .then(pastaData => {
            loadPasta(pastaData);
        })
        .catch(error => {
            console.error('Error fetching pasta data:', error);
        });
}


function isEaten(pasta) {
    return eatenSet.has(String(pasta.number));
}

// Some discovered pastas have no classic pack number (keyed by a slug instead).
function hasNumber(pasta) {
    return /^\d+$/.test(String(pasta.number));
}

// Short label for the small number shown behind a thumbnail.
function thumbLabel(pasta) {
    return hasNumber(pasta)
        ? pasta.number
        : pasta.name.replace(/[^A-Za-z]/g, '').slice(0, 3);
}

// Swap a broken image out for a numbered placeholder tile.
function markImageFailed(img) {
    img.classList.add('failed');
}

function loadPasta(pastaData) {
    allPasta = pastaData;

    pastaData.forEach(pasta => {
        pastaCountries[pasta.name] = Object.keys(pasta.links);
    });

    // Build the filmstrip of thumbnails
    const filmstrip = document.getElementById('filmstrip');
    filmstrip.innerHTML = '';

    pastaData.forEach((pasta, index) => {
        const thumb = document.createElement('button');
        thumb.className = 'thumb' + (isEaten(pasta) ? ' eaten' : ' not-eaten');
        thumb.dataset.index = index;
        thumb.title = hasNumber(pasta) ? `${pasta.name} (No. ${pasta.number})` : pasta.name;
        thumb.setAttribute('aria-label', thumb.title);

        const num = document.createElement('span');
        num.className = 'thumb-num';
        num.textContent = thumbLabel(pasta);

        const img = document.createElement('img');
        img.src = pasta.image;
        img.alt = pasta.name;
        img.loading = 'lazy';
        img.onerror = () => markImageFailed(img);

        thumb.appendChild(num);
        thumb.appendChild(img);
        thumb.addEventListener('click', () => selectIndex(index));
        filmstrip.appendChild(thumb);
    });

    // Eaten progress (how many of the gallery's pastas have been eaten)
    updateEatenProgress();

    // Wire up navigation
    document.getElementById('prevPasta').addEventListener('click', () => cycle(-1));
    document.getElementById('nextPasta').addEventListener('click', () => cycle(1));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') cycle(-1);
        if (e.key === 'ArrowRight') cycle(1);
    });

    // Select the first item programmatically
    selectIndex(0);
}

function updateEatenProgress() {
    const total = allPasta.length;
    const eaten = allPasta.filter(isEaten).length;
    const pct = total ? Math.round((eaten / total) * 100) : 0;
    document.getElementById('eatenCount').textContent = `${eaten} / ${total} · ${pct}%`;
    document.getElementById('eatenFill').style.width = pct + '%';
}

function cycle(delta) {
    if (!allPasta.length) return;
    const next = (currentIndex + delta + allPasta.length) % allPasta.length;
    selectIndex(next);
}

function selectIndex(index) {
    if (index < 0 || index >= allPasta.length) return;
    currentIndex = index;
    const pasta = allPasta[index];

    // Highlight the active thumbnail and scroll it into view
    const thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach(t => t.classList.remove('active'));
    const activeThumb = thumbs[index];
    if (activeThumb) {
        activeThumb.classList.add('active');
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // Update the stage (large selected pasta)
    const stageImg = document.querySelector('.current-pasta');
    const stageFallback = document.getElementById('stageFallback');
    stageImg.classList.remove('failed');
    stageFallback.textContent = thumbLabel(pasta);
    stageImg.alt = `Image of ${pasta.name}`;
    stageImg.onerror = () => markImageFailed(stageImg);
    stageImg.src = pasta.image;

    document.getElementById('pastaName').textContent = pasta.name;
    document.getElementById('pastaNumberDisplay').textContent =
        hasNumber(pasta) ? `No. ${pasta.number}` : 'Special / no number';

    const eaten = isEaten(pasta);
    const eatenLine = document.getElementById('eatenLine');
    eatenLine.textContent = eaten ? '✓ Eaten' : 'Not yet eaten';
    eatenLine.className = 'eaten-line ' + (eaten ? 'is-eaten' : 'is-uneaten');

    // Optional tasting notes + rating
    const meta = PASTA_META[String(pasta.number)] || {};

    const ratingEl = document.getElementById('pastaRating');
    if (typeof meta.rating === 'number') {
        const full = Math.round(meta.rating);
        ratingEl.textContent = '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
        ratingEl.classList.remove('empty');
    } else {
        ratingEl.textContent = 'Not rated yet';
        ratingEl.classList.add('empty');
    }

    const descEl = document.getElementById('pastaDescription');
    if (meta.description) {
        descEl.textContent = meta.description;
        descEl.classList.remove('empty');
    } else {
        descEl.textContent = 'No tasting notes yet.';
        descEl.classList.add('empty');
    }

    // Highlight the countries on the map where this pasta is available
    highlightCountries(pasta.name);
}


// function highlightCountries(pastaName) {
//     const countries = pastaCountries[pastaName] || [];
//     vectorSource.clear(); // Clear existing features
//     loadGeoJson(countries); // Load and style GeoJSON based on selected pasta
// }

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
    console.log(pastaCountries)

    const countriesToHighlight = pastaCountries[pastaName] || [];

    // Apply the highlight style to the features that match the selected pasta's countries
    geoJsonFeatures.forEach((feature) => {
        const countryId = feature.getId();
        feature.setStyle(countriesToHighlight.includes(countryId) ? highlightStyle : defaultStyle);
    });
}

// Initialize the map on load
// window.onload = ;

document.addEventListener("DOMContentLoaded", () => {
    initMapAndList();
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
