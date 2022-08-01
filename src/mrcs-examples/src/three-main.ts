import * as THREE from 'three';
import {
    HoloVideoObjectThreeJS,
    States,
} from '@MixedRealityCaptureStudios/holo-video-object-three';

// Initialize canvas and WebGL:
const container = document.createElement('div');
document.body.appendChild(container);

var canvas = document.createElement('canvas');
var context: any = canvas.getContext('webgl2');
if (!context) { // WebGL2 not available, fall back to WebGL1
    context = canvas.getContext('webgl');
    if (!context) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    }
}

// Setup three.js renderer:
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, context });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('touchstart', onMouseDown, false);
container.appendChild(renderer.domElement);

// Setup scene:
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 2000);
camera.position.set(0, 300, 1000);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6495ed);

var light = new THREE.DirectionalLight( 0xffffff );
light.position.set(-0.5, 0.5, 1).normalize();
scene.add(light);

// Add some test geometry:
var boxGeometry = new THREE.BoxBufferGeometry(200, 200, 200);
var boxMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
boxMesh.position.set(150, 100, 0);
scene.add(boxMesh);

// Add HCap content:
const hvo = new HoloVideoObjectThreeJS(
    renderer, 
    function(mesh) {
        mesh.position.set(-150, 0, 0);
        mesh.rotation.set(0, -3.14, 0);
        mesh.scale.set(0.2, 0.2, 0.2);
        // Force an unlit material. Comment out this line if your capture has normals and you want to use dynamic lighting.
        mesh.material = new THREE.MeshBasicMaterial({ map: mesh.material.map });
        scene.add(mesh);
    }
);

hvo.open("../captures/soccer_normals/soccer_normals.hcap", { autoloop: true, audioEnabled: true });

// Start animation loop:
animate();

function onMouseDown() {
    if (hvo.state == States.Opened ||
        hvo.state == States.Opening) {
        hvo.play();
    }
}

function animate() {
    requestAnimationFrame(animate);

    // animate box test geometry:
    boxMesh.rotation.y += 0.01;

    // update hologram to latest frame of playback:
    hvo.update();

    // let three.js render the scene:
    renderer.render(scene, camera);
}
