import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import nx from './assets/nx.jpg';
import ny from './assets/ny.jpg';
import nz from './assets/nz.jpg';
import px from './assets/px.jpg';
import py from './assets/py.jpg';
import pz from './assets/pz.jpg';

const cubeTextureLoader = new THREE.CubeTextureLoader();
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    w: false,
    s: false,
    a: false,
    d: false,
};

// Initialize the camera's spherical coordinates.
let radius = 10; // The distance from the object.

// Set theta to 90 degrees to start looking straight ahead.
let theta = 90; // The angle down from the y-axis.
let phi = 0; // The angle around the y-axis.

// The object's position.
let objectPos = new THREE.Vector3(0, 0, 0);

// The speed at which the camera rotates in degrees (adjust as needed).
let rotationSpeed = 1;

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'ArrowDown':
            keys.down = true;
            break;
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'w':
            keys.w = true;
            break;
        case 's':
            keys.s = true;
            break;
        case 'a':
            keys.a = true;
            break;
        case 'd':
            keys.d = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            break;
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'w':
            keys.w = false;
            break;
        case 's':
            keys.s = false;
            break;
        case 'a':
            keys.a = false;
            break;
        case 'd':
            keys.d = false;
            break;
    }
});

function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
    });
    // renderer.setClearColor(0xabcdef); // Replace with any hex color.

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();
    const texture = cubeTextureLoader.load([
        px, // right
        nx, // left
        py, // top
        ny, // bottom
        pz, // back
        nz, // front
    ]);
    scene.background = texture;

    // Create a material for the ground. We'll use a basic material and set its color to white.
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create a geometry for the ground. This will be a large plane.
    // The first two parameters are the width and height of the plane.
    const groundGeometry = new THREE.PlaneGeometry(200, 200);

    // Create a mesh from the geometry and material, and add it to the scene.
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    // start the ground plane at a low point so it doesn't clip through the objects.
    // we also don't want it at eye level with the camera.
    ground.position.y = -50;

    // Rotate the ground plane so it's horizontal.
    ground.rotation.x = -Math.PI / 2;

    // Add the ground to the scene.
    scene.add(ground);

    function animate() {
        requestAnimationFrame(animate);

        // Adjust the camera's spherical coordinates based on the user's input.
        if (keys.up) theta += rotationSpeed;
        if (keys.down) theta -= rotationSpeed;
        if (keys.left) phi += rotationSpeed;
        if (keys.right) phi -= rotationSpeed;

        // Restrict theta so the camera doesn't flip over the top or bottom of the object.
        theta = Math.max(0.1, Math.min(179.9, theta));

        // Convert degrees to radians.
        let thetaRad = THREE.MathUtils.degToRad(theta);
        let phiRad = THREE.MathUtils.degToRad(phi);

        // Convert spherical coordinates to Cartesian (x, y, z).
        let x = radius * Math.sin(thetaRad) * Math.sin(phiRad);
        let y = radius * Math.cos(thetaRad);
        let z = radius * Math.sin(thetaRad) * Math.cos(phiRad);

        // Update the camera's position.
        camera.position.set(x, y, z);
        // Make the camera point towards the object.
        camera.lookAt(objectPos);

        // The speed at which the ground moves (but it looks like the camera is moving)
        let moveSpeed = 2;

        // Adjust the ground position based on the user's input (and the camera settings).
        // Adjust the ground's position based on the user's input.
        if (keys.w) {
            ground.position.x += moveSpeed * Math.sin(phiRad);
            ground.position.z += moveSpeed * Math.cos(phiRad);
        }
        if (keys.s) {
            ground.position.x -= moveSpeed * Math.sin(phiRad);
            ground.position.z -= moveSpeed * Math.cos(phiRad);
        }
        if (keys.a) {
            ground.position.x += moveSpeed * Math.cos(phiRad);
            ground.position.z -= moveSpeed * Math.sin(phiRad);
        }
        if (keys.d) {
            ground.position.x -= moveSpeed * Math.cos(phiRad);
            ground.position.z += moveSpeed * Math.sin(phiRad);
        }

        renderer.render(scene, camera);
    }
    animate();
}

main();
