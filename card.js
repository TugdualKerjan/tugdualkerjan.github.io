import * as THREE from './threejs/build/three.module.js';
import * as JQ from './jquery.js';

import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';

const cardSize = 100;

let scene, camera, renderer, timer, fonter, textureLoader, amountOfRows, amountOfCols, cardWidth, cardHeight;

var cards = [];
function loadCards(gltf) {

    loadJSON(function (response) {
        var data = JSON.parse(response);

        var default_card = gltf.scene.getObjectByName("Plane");


        //! Should get a json file with title, image, description
        for (var i = 0; i < data["cards"].length; i++) {

            var card = default_card.clone();
            card.material = new THREE.MeshLambertMaterial({ color: new THREE.Color(0, 0, 0).setHSL(Math.random(), 1, 0.1) });
            // card.copy(default_card, true);

            //Load font
            addText(card, data["cards"][i]["title"], 0.1, -0.85, -0.85);
            addText(card, data["cards"][i]["desc"], 0.05, 0, -0.85);

            //Load pictures
            addPic(card, 'assets/images/' + data["cards"][i]["img"]);

            // card.position.y += i * 0.1;
            //Load card and give it a material
            scene.add(card);
            cards.push(card);
        }

        var bbox = new THREE.Box3().setFromObject(default_card);

        var pixelHeight = innerHeight / 2;
        var pixelWidth = pixelHeight / 1.61803398875;
        amountOfCols = Math.floor(innerWidth / pixelWidth); 
        console.log(innerHeight, innerWidth, pixelWidth, innerWidth/pixelWidth);

        amountOfRows = 2;
        console.log("Max: " + amountOfCols);
        // console.log(pixelWidth, pixelHeight);
        // console.log(amountOfRows, amountOfCols);
        // console.log(innerWidth + " " + innerHeight);
        var padding = 1.1;
        
        cardHeight = 2 * 1.61803398875 * padding;
        console.log(cardHeight);
        cardWidth = 2 * padding;
        console.log(cardWidth);
        
        var camWidth = cardHeight * innerWidth / innerHeight;

        camera = new THREE.OrthographicCamera(-camWidth, camWidth, cardHeight, -cardHeight, -100, 100);
        camera.rotation.y = Math.PI / 2;

        camera.position.x = 1;
        camera.position.y = 0;
        camera.position.z = 0;

        new OrbitControls(camera, renderer.domElement);

        timer = new THREE.Clock();
        timer.start();
        animate();
    });
}

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'test.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function addPic(mesh, filename) {
    textureLoader.load(filename, function (texture) {
        var geometry = new THREE.PlaneGeometry(2 * 0.95, 0.95 * 2 / 2.61803398875); // Golden ratio resized (2 : 1);
        var material = new THREE.MeshBasicMaterial({ map: texture }); //Set texture on mesh

        var picMesh = new THREE.Mesh(geometry, material);
        picMesh.rotation.x = Math.PI / 2;
        picMesh.rotation.z = Math.PI / 2;

        //Place just below text
        picMesh.position.x -= 0.45; //For some reason bounding box on x axis twice as big
        picMesh.position.y = -0.01; //Get it out of the plane
        mesh.add(picMesh);
    });
}

function addText(mesh, text, size, x, y) {
    var geometry = new THREE.TextGeometry(text, {
        font: fonter,
        size: size,
        height: 0.01,
    });
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var textMesh = new THREE.Mesh(geometry, material);
    // Rotate for card
    textMesh.rotation.x = Math.PI / 2;
    textMesh.rotation.z = Math.PI / 2;

    //Relative to the card as it is parented
    textMesh.position.x += x; //For some reason bounding box on x axis twice as big
    textMesh.position.z += y;
    mesh.add(textMesh);
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    scene.add(new THREE.AxesHelper(5));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var hlight = new THREE.AmbientLight(0x404040, 1);
    scene.add(hlight);

    new THREE.FontLoader().load('assets/fonts/Oswald_Regular.json', function (result) {
        fonter = result;
    });

    textureLoader = new THREE.TextureLoader();

    var loader = new GLTFLoader();
    loader.load('assets/card/card.glb', loadCards);
}


function animate() {
    requestAnimationFrame(animate);
    if (cards.length != 0) {
        for (var i = 0; i < cards.length; i++) {
            var time = Math.min(Math.max(timer.getElapsedTime() - 2 - i, 0), 1) / 1;
            var col = i % amountOfCols;
            var row = Math.floor(i / amountOfCols);
            // console.log(i, amountOfCols, col, amountOfRows, row, Math.floor(amountOfCols/2), col * i - Math.floor(amountOfCols/2), row * i - Math.floor(amountOfRows/2));
            col = cardWidth * (col - (amountOfCols-1)/2);
            row = cardHeight * (row - (amountOfRows-1)/2);
            cards[i].position.set(0, row * time, col * time);
            cards[i].rotation.z = time * Math.PI / 2;
            // cards[i].rotation.x = time * Math.PI;
        }
    }
    renderer.render(scene, camera);
}

init();

//     var light = new THREE.PointLight(0xc4c4c4, 1);
//     light.position.set(0, 300, 500);
//     scene.add(light);