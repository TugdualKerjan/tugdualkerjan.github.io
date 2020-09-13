import * as THREE from './threejs/build/three.module.js';

let INTERSECTEDQUAT, INTERSECTED, amountOfRows, amountOfCols, cardWidth, cardHeight;

export function addLights(scene) {
    var directionalLight = new THREE.DirectionalLight(0xffffdd, 1);
    directionalLight.position.set(1, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    var hlight = new THREE.AmbientLight(0x404040, 1);
    scene.add(hlight);
    var light = new THREE.PointLight(0xc4c4c4, 1);
    light.position.set(0, 300, 500);
    scene.add(light);
    var light3 = new THREE.PointLight(0xc4c4c4, 1);
    light3.position.set(0, 300, -500);
    scene.add(light3);
    var light5 = new THREE.PointLight(0xc4c4c4, 1);
    light5.position.set(0, -200, 0);
    scene.add(light5);
}

export function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'cards.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

export function addCard(default_card, data, titleFont, descFont, scene, textureLoader, spaceship) {
    //Random material that is shiny
    var card = default_card.clone();
    card.material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0, 0, 0).setHSL(Math.random(), 1, 0.15),
        transparent: true,
        opacity: 0.50,
        shininess: 20,
        specular: 0x682900,
    });
    //Load font
    addText(card, data["title"], 0.1, -0.85, -0.85, titleFont);
    addText(card, data["date"], 0.1, -0.85, 0.35, titleFont);
    addText(card, wordWrap(data["desc"], 50), 0.05, 0.05, -0.90, descFont);

    //Load pictures
    addPic(textureLoader, card, 'assets/images/' + data["img"]);
    addPicBack(textureLoader, card, 'assets/images/pokemon.png');

    //Card + boundingBox
    card.rotation.z = -Math.PI / 2;
    var bbox = new THREE.Box3().setFromObject(card);
    var geometry = new THREE.BoxGeometry(bbox.max.x * 2, bbox.max.y * 2, bbox.max.z * 2);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    var cube = new THREE.Mesh(geometry, material);
    cube.link = data["url"];

    //Add card
    cube.add(card);
    cube.position.set(0, 0 - cardHeight, 0);
    scene.add(cube);

    if (cube.link == "spaceship") {
        card.add(spaceship);
        spaceship.position.y -= 0.6;
        spaceship.position.x -= 0.5;
        spaceship.visible = false;
    }
    return cube;
}

function addPicBack(textureLoader, mesh, filename) {
    textureLoader.load(filename, function(texture) {
        var geometry = new THREE.PlaneBufferGeometry(2, 2); // Golden ratio resized (2 : 1);
        var material = new THREE.MeshBasicMaterial({ map: texture, opacity: 1 }); //Set texture on mesh

        var picMesh = new THREE.Mesh(geometry, material);
        picMesh.rotation.x = -Math.PI / 2;

        picMesh.position.y += 0.0001;

        mesh.add(picMesh);
    });
}

function addText(mesh, text, size, x, y, font) {
    var geometry = new THREE.TextBufferGeometry(text, {
        font: font,
        size: size,
        height: 0.012,
    });
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var textMesh = new THREE.Mesh(geometry, material);
    // Rotate for card
    textMesh.rotation.x = Math.PI / 2;
    textMesh.rotation.z = Math.PI / 2;

    //Relative to the card as it is parented
    textMesh.position.x += x; //For some reason bounding box on x axis twice as big
    textMesh.position.z += y;
    textMesh.position.y -= 0.001;
    mesh.add(textMesh);
}

function addPic(textureLoader, mesh, filename) {
    textureLoader.load(filename, function(texture) {
        var geometry = new THREE.PlaneBufferGeometry(0.95 * 2, 0.95 * 2 / Math.pow(1.61803398875, 2)); // Golden ratio resized (2 : 1);
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

const phi = 1.61803398875

export function setCardProportions(innerWidth, innerHeight) {
    var pixelHeight = innerHeight / 2;
    var pixelWidth = pixelHeight / phi;
    amountOfCols = Math.floor(innerWidth / pixelWidth);
    amountOfRows = 2;

    var padding = 1.02;

    cardHeight = phi * padding;
    cardWidth = padding;
}

const animation_duration = 0.5;
export function animateCards(cards, timer, camera, mouse, raycaster, spaceship) {
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (timer.getElapsedTime() > i + animation_duration + 0.1) {
            spaceship.rotation.x += 0.003;
            var newPos = new THREE.Vector2(Math.pow(mouse.x, 3) / 10, Math.pow(mouse.y, 3) / 10);
            camera.position.y += newPos.y;
            camera.position.z -= newPos.x;
            var intersects = raycaster.intersectObjects(cards);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object.children[0] && intersects[0].object == card) {
                    undoPop();
                    INTERSECTED = intersects[0].object.children[0];
                    if (INTERSECTEDQUAT == undefined) INTERSECTEDQUAT = INTERSECTED.quaternion.clone();
                    doPop();
                }
            } else {
                undoPop();
                INTERSECTED = null;
            }
        } else if (timer.getElapsedTime() >= i) {
            var time = clamp(timer.getElapsedTime() - i, 0, animation_duration) * 2;
            var col = i % amountOfCols;
            var row = Math.floor(i / amountOfCols);
            col = cardWidth * ((amountOfCols - 1) / 2 - col);
            row = cardHeight * ((amountOfRows - 1) / 2 - row);
            card.position.set(0, row * time, col * time);
            card.rotation.x = -time * Math.PI;
            card.rotation.y = -time * Math.PI;
        }
    }
    if (INTERSECTED) {
        INTERSECTED.rotation.z = (0.5 * (raycaster.intersectObject(INTERSECTED.parent, false)[0]["uv"]["y"] - 1 / 2)) - Math.PI / 2;
        INTERSECTED.rotation.y = -(0.6 * (raycaster.intersectObject(INTERSECTED.parent, false)[0]["uv"]["x"] - 1 / 2));
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

const xPosPop = 0.7,
    scalePop = 1.1,
    emissiveHex = 0x333333,
    opacityPop = 0.7;

function doPop() {
    INTERSECTED.scale.multiplyScalar(scalePop);
    INTERSECTED.material.opacity = 1;
    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    INTERSECTED.material.emissive.setHex(emissiveHex);
    INTERSECTED.position.x -= xPosPop;
}

function undoPop() {
    if (INTERSECTED) {
        INTERSECTED.position.x += xPosPop;
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED.scale.divideScalar(scalePop);
        INTERSECTED.material.opacity = opacityPop;
        INTERSECTED.quaternion.set(INTERSECTEDQUAT.x, INTERSECTEDQUAT.y, INTERSECTEDQUAT.z, INTERSECTEDQUAT.w);
    }
}