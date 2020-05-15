var loader = new THREE.GLTFLoader();

let scene, camera, renderer;
    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdddddd);
        camera = new THREE.PerspectiveCamera(40, Window.innerWidth / window.innerHeight, 1, 5000);
        camera.rotation.y = 45 / 180 * Math.PI;
        camera.position.x = 800;
        camera.position.y = 100;
        camera.position.z = 1000;
        var hlight = new THREE.AmbientLight(0x404040, 100);
        scene.add(hlight);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        let loader = new THREE.GLTFLoader();
				document.body.appendChild(renderer.domElement);
        loader.load('../3js/js/scene.gltf', function (gltf) {
            var car = gltf.scene.children[0];
            car.scale.set(0.5, 0.5, 0.5);
            scene.add(gltf.scene);
            renderer.render(scene, camera);
        });
    }
    init();
