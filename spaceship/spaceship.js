import * as THREE from './threejs/build/three.module.js';

import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './threejs/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, car, cube;
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    camera.rotation.y = 45 / 180 * Math.PI;
    camera.position.x = 6;
    camera.position.y = 6;
    camera.position.z = 6;
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', renderer);
    var hlight = new THREE.AmbientLight(0x404040, 1);
    scene.add(hlight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    var light = new THREE.PointLight(0xc4c4c4, 1);
    light.position.set(0, 300, 500);
    scene.add(light);
    var light2 = new THREE.PointLight(0xc4c4c4, 1);
    light2.position.set(500, 100, 0);
    scene.add(light2);
    var light3 = new THREE.PointLight(0xc4c4c4, 1);
    light3.position.set(0, 100, -500);
    scene.add(light3);
    var light4 = new THREE.PointLight(0xc4c4c4, 1);
    light4.position.set(-500, 300, 500);
    scene.add(light4);
    var light5 = new THREE.PointLight(0xc4c4c4, 1);
    light5.position.set(0, -200, 0);
    scene.add(light5);
    let loader = new GLTFLoader();
    loader.load('assets/spaceship/spaceship.glb', function (gltf) {
        car = gltf.scene.children[0];
        scene.add(gltf.scene);
        animate();
    });
}
function animate() {
    requestAnimationFrame(animate);
    car.rotation.y += 0.005;
    console.log("Frame");
    renderer.render(scene, camera);
}
init();