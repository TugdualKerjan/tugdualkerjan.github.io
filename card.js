import * as THREE from './threejs/build/three.module.js';

import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';

const cardSize = 100;

let scene, camera, renderer, timer, raycaster, titleFont, descFont, INTERSECTEDQUAT, textureLoader, amountOfRows, amountOfCols, cardWidth, cardHeight;

var mouse = new THREE.Vector2(), INTERSECTED;

var cards = [];
function loadCards(gltf) {

    loadJSON(function (response) {
        var data = JSON.parse(response);

        var default_card = gltf.scene.getObjectByName("Plane");


        //! Should get a json file with title, image, description
        for (var i = 0; i < data["cards"].length; i++) {

            var card = default_card.clone();
            card.material = new THREE.MeshLambertMaterial({
                color: new THREE.Color(0, 0, 0).setHSL(Math.random(), 1, 0.2),
                transparent: true,
                opacity: 0.50,
                shininess: 100
            });

            //Load font
            addText(card, data["cards"][i]["title"], 0.1, -0.85, -0.85, titleFont);
            addText(card, wordWrap(data["cards"][i]["desc"], 50), 0.05, 0.05, -0.90, descFont);

            //Load pictures
            addPic(card, 'assets/images/' + data["cards"][i]["img"]);
            addPicBack(card, 'assets/images/pokemon.png');

            card.position.x = 0;
            card.position.z = 0;
            card.rotation.z = -Math.PI / 2;
            var bbox = new THREE.Box3().setFromObject(card);
            var geometry = new THREE.BoxGeometry(bbox.max.x * 2, bbox.max.y * 2, bbox.max.z * 2);
            var material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            var cube = new THREE.Mesh(geometry, material);
            cube.add(card);

            //Load card and give it a material
            scene.add(cube);
            cards.push(cube);
        }


        var pixelHeight = innerHeight / 2;
        var pixelWidth = pixelHeight / 1.61803398875;
        amountOfCols = Math.floor(innerWidth / pixelWidth);
        console.log(innerHeight, innerWidth, pixelWidth, innerWidth / pixelWidth);

        amountOfRows = 2;
        console.log("Max: " + amountOfCols);
        var padding = 1.02;

        cardHeight = 2 * 1.61803398875 * padding;
        console.log(cardHeight);
        cardWidth = 2 * padding;
        console.log(cardWidth);

        var camWidth = cardHeight * innerWidth / innerHeight;

        // camera = new THREE.OrthographicCamera(-camWidth, camWidth, cardHeight, -cardHeight, -100, 100);
        camera = new THREE.PerspectiveCamera(2 * 45, innerWidth / innerHeight, 1, 1000);
        camera.rotation.y = Math.PI / 2;

        camera.position.x = 5;
        camera.position.y = 0;
        camera.position.z = 0;

        var controls = new OrbitControls(camera, renderer.domElement);
        // controls.addEventListener( 'change', render ); // use this only if there is no animation loop
        controls.enableZoom = false;
        // controls.enablePan = true;
        // controls.keyPanSpeed = 300;
        controls.enableRotate = false;
        // controls.screenSpacePanning = true;

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

function addPicBack(mesh, filename) {
    textureLoader.load(filename, function (texture) {
        var geometry = new THREE.PlaneBufferGeometry(2, 2); // Golden ratio resized (2 : 1);
        var material = new THREE.MeshBasicMaterial({ map: texture, opacity: 1 }); //Set texture on mesh

        var picMesh = new THREE.Mesh(geometry, material);
        picMesh.rotation.x = -Math.PI / 2;

        picMesh.position.y += 0.0001;

        mesh.add(picMesh);
    });
}

function addPic(mesh, filename) {
    textureLoader.load(filename, function (texture) {
        var geometry = new THREE.PlaneBufferGeometry(2 * 0.95, 0.95 * 2 / 2.61803398875); // Golden ratio resized (2 : 1);
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

function addText(mesh, text, size, x, y, font) {
    var geometry = new THREE.TextBufferGeometry(text, {
        font: font,
        size: size,
        height: 0.001,
    });
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var textMesh = new THREE.Mesh(geometry, material);
    // Rotate for card
    textMesh.rotation.x = Math.PI / 2;
    textMesh.rotation.z = Math.PI / 2;

    //Relative to the card as it is parented
    textMesh.position.x += x; //For some reason bounding box on x axis twice as big
    textMesh.position.z += y;
    textMesh.position.y -= 0.0001;
    mesh.add(textMesh);
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    // scene.add(new THREE.AxesHelper(5));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.body.addEventListener('mousemove', onDocumentMouseMove, false);
    document.body.addEventListener('mouseleave', onMouseLeave);

    var directionalLight = new THREE.DirectionalLight(0xffffdd, 1);
    directionalLight.position.set(1, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var hlight = new THREE.AmbientLight(0x404040, 1);
    scene.add(hlight);

    raycaster = new THREE.Raycaster();

    var fontLoader = new THREE.FontLoader();

    fontLoader.load('assets/fonts/Montserrat.json', function (result) {
        descFont = result;
    });

    fontLoader.load('assets/fonts/Oswald_Regular.json', function (result) {
        titleFont = result;
    });

    textureLoader = new THREE.TextureLoader();

    textureLoader.load('assets/images/space.jpg', function (texture) {
        scene.background = texture;
    });

    var loader = new GLTFLoader();
    loader.load('assets/card/card.glb', loadCards);
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse);
}

function onMouseLeave(event) {
    event.preventDefault();

    mouse.x = 0;
    mouse.y = 0;
    console.log(mouse);

}

function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    if (cards.length != 0) {
        if (timer.getElapsedTime() - 3 - 2 > 0) {
            var bob = new THREE.Vector2(Math.pow(mouse.x, 3) / 10, Math.pow(mouse.y, 3) / 10);
            camera.position.y += bob.y;
            camera.position.z -= bob.x;
            var intersects = raycaster.intersectObjects(cards);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object.children[0]) {
                    if (INTERSECTED) {
                        INTERSECTED.position.x += 0.7;
                        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                        INTERSECTED.scale.divideScalar(1.1);
                        INTERSECTED.material.opacity = 0.70;
                        INTERSECTED.quaternion.set(INTERSECTEDQUAT.x, INTERSECTEDQUAT.y, INTERSECTEDQUAT.z, INTERSECTEDQUAT.w);
                    }
                    INTERSECTED = intersects[0].object.children[0];
                    if (INTERSECTEDQUAT == undefined) INTERSECTEDQUAT = INTERSECTED.quaternion.clone();
                    INTERSECTED.scale.multiplyScalar(1.1);
                    INTERSECTED.material.opacity = 1;
                    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                    INTERSECTED.material.emissive.setHex(0x333333);
                    INTERSECTED.position.x -= 0.7;

                }
                if (INTERSECTED && INTERSECTED.quaternion && INTERSECTEDQUAT) {
                    INTERSECTED.rotation.z = (0.5 * (raycaster.intersectObject(INTERSECTED.parent, false)[0]["uv"]["y"] - 1 / 2)) - Math.PI / 2;
                    INTERSECTED.rotation.y = -(0.6 * (raycaster.intersectObject(INTERSECTED.parent, false)[0]["uv"]["x"] - 1 / 2));
                }
            } else {
                if (INTERSECTED) {
                    INTERSECTED.position.x += 0.7;
                    INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                    INTERSECTED.scale.divideScalar(1.1);
                    INTERSECTED.material.opacity = 0.70;
                    INTERSECTED.quaternion.set(INTERSECTEDQUAT.x, INTERSECTEDQUAT.y, INTERSECTEDQUAT.z, INTERSECTEDQUAT.w);
                }
                INTERSECTED = null;
            }
        } else {
            for (var i = 0; i < cards.length; i++) {
                if (timer.getElapsedTime() - 3 - 0.4 - i * 0.3 > 0) {
                    var time = Math.min(Math.max(timer.getElapsedTime() - 3 - 0.4 - i * 0.3, 0), 0.4) / 0.4;
                    var col = i % amountOfCols;
                    var row = Math.floor(i / amountOfCols);
                    col = cardWidth * -(col - (amountOfCols - 1) / 2);
                    row = cardHeight * -(row - (amountOfRows - 1) / 2);
                    cards[i].position.set(0, row * time - (Math.sin(Math.PI / 2 * (1 - time))) * cardHeight, col * time);
                    cards[i].rotation.x = -time * Math.PI;
                    cards[i].rotation.y = -time * Math.PI;
                } else {
                    var time = Math.min(Math.max(timer.getElapsedTime() - 3 - i * 0.3, 0), 0.4) / 0.4;
                    cards[i].position.set(0, -8 * (1 - time) - cardHeight, 0);
                }
            }
        }
    }
    renderer.render(scene, camera);
}

init();

function wordWrap(str, maxWidth) {
    var newLineStr = "\n";
    var done = false;
    var res = '';
    while (str.length > maxWidth) {
        var found = false;
        // Inserts new line at first whitespace of the line
        for (var i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

    }

    return res + str;
}

function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
};