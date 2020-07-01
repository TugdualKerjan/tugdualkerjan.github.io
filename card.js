import * as THREE from './threejs/build/three.module.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';
import { loadJSON, addLights, addCard, animateCards, setCardProportions } from './utilities.js';

let scene, camera, renderer, timer, spaceship, raycaster, titleFont, descFont, textureLoader;

var mouse = new THREE.Vector2();

var cards = [];
function loadCards(gltf) {

    loadJSON(function (response) {
        var data = JSON.parse(response);
        var default_card = gltf.scene.getObjectByName("Plane");

        for (var i = 0; i < data["cards"].length; i++) {
            cards.push(addCard(default_card, data["cards"][i], titleFont, descFont, scene, textureLoader, spaceship));
        }

        //Calculate card 
        setCardProportions(innerWidth, innerHeight);

        //Camera alignment
        camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 1, 1000);
        camera.rotation.y = Math.PI / 2;

        camera.position.x = 3;
        camera.position.y = 0;
        camera.position.z = 0;

        timer = new THREE.Clock();
        timer.start();
        animate();
    });
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    // scene.add(new THREE.AxesHelper(5));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.body.addEventListener('mousemove', onDocumentMouseMove, false);
    document.body.addEventListener('click', onClick);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mousewheel', onMouseWheel, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchstart', onTouchStart, { passive: false });

    addLights(scene);

    raycaster = new THREE.Raycaster();

    var fontLoader = new THREE.FontLoader();

    textureLoader = new THREE.TextureLoader();
    var loader = new GLTFLoader();
    fontLoader.load('./assets/fonts/Montserrat.json', function (result) {
        descFont = result;
        fontLoader.load('./assets/fonts/Oswald_Regular.json', function (result) {
            titleFont = result;
            textureLoader.load('./assets/images/space.jpg', function (texture) {
                scene.background = texture;
                loader.load('./assets/spaceship/spaceship.glb', function (gltf) {
                    spaceship = gltf.scene.children[0];
                    spaceship.scale.multiplyScalar(0.15);
                    spaceship.rotation.x = Math.PI / 2;
                    spaceship.rotation.z = Math.PI / 2;
                    loader.load('./assets/card/card.glb', loadCards);
                });
            });
        });
    });
}


function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    if (cards.length != 0) {
        animateCards(cards, timer, camera, mouse, raycaster, spaceship);
    }
    renderer.render(scene, camera);
}


function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseLeave(event) {
    event.preventDefault();

    mouse.x = 0;
    mouse.y = 0;
}

function onClick(event) {
    event.preventDefault();

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(cards, false); //array
    spaceship.visible = false;
    if (intersects.length > 0) {
        var selectedObject = intersects[0].object;
        console.log(selectedObject.link);
        if (selectedObject.link != "") {
            if (selectedObject.link != "spaceship") {
                window.open(selectedObject.link);
            } else {
                spaceship.visible = true;
            }
        }
    }
}

var start = 0;

function onTouchStart(event) {
    event.preventDefault();
    //   start.x = event.touches[0].pageX;
    start = event.touches[0].pageY;
}

function onTouchMove(event) {
    event.preventDefault();
    console.log(event);

    // offset.x = start.x - event.touches[0].pageX;
    var delta = start - event.touches[0].pageY;
    start = event.touches[0].pageY;
    console.log(delta);
    camera.position.y += delta * 0.01;
}

function onMouseWheel(event) {
    event.preventDefault();

    // var deltaY = ( event.touches[ 0 ].pageY - startY );
    console.log(event);
    camera.position.y -= (event.deltaY * 0.0001);
    console.log(camera.position.y);
}

// function onTouchMove(event) {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);
//     var intersects = raycaster.intersectObjects(cards, false); //array
//     spaceship.visible = false;
//     if (intersects.length > 0) {
//         var selectedObject = intersects[0].object;
//         console.log(selectedObject.link);
//         if (selectedObject.link != "") {
//             if (selectedObject.link != "spaceship") {
//                 window.open(selectedObject.link);
//             } else {
//                 spaceship.visible = true;
//             }
//         }
//     }
// }

init();