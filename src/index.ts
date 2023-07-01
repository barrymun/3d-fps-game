import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import nx from './assets/nx.jpg';
import ny from './assets/ny.jpg';
import nz from './assets/nz.jpg';
import px from './assets/px.jpg';
import py from './assets/py.jpg';
import pz from './assets/pz.jpg';
import m4 from './assets/low-poly/m4.glb';

const cubeTextureLoader = new THREE.CubeTextureLoader();
const gltfLoader = new GLTFLoader();

let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

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
const startingGroundYPosition: number = -30;

// Initialize the camera's spherical coordinates.
let radius = 10; // The distance from the object.

// Set theta to 90 degrees to start looking straight ahead.
let theta = 90; // The angle down from the y-axis.
let phi = 0; // The angle around the y-axis.

// The object's position.
let objectPos = new THREE.Vector3(0, 0, 0);

// The speed at which the camera rotates in degrees (adjust as needed).
let rotationSpeed = 1;

let breathingSpeed = 0.02; // This will control how fast the bobbing effect happens
let breathingAmount = 0.2; // This will control how much the camera bobs up and down
let breathingProgress = 0.0; // This will keep track of the progress through the bobbing pattern

let movementSpeed = 0.04;
let movementAmount = 0.3;
let movementProgress = 0.0;

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
            movementProgress = 0.0;
            returnToStartingGroundPosition();
            break;
        case 's':
            keys.s = false;
            movementProgress = 0.0;
            returnToStartingGroundPosition();
            break;
        case 'a':
            keys.a = false;
            break;
        case 'd':
            keys.d = false;
            break;
    }
});

function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function returnToStartingGroundPosition() {
    if (ground.position.y > startingGroundYPosition) {
        ground.position.y -= 1.0;
        await delay(10);
        returnToStartingGroundPosition();
    }
}

function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({
        canvas,
        // alpha: true,
        antialias: true,
    });
    // https://discourse.threejs.org/t/render-looks-blurry-and-pixelated-even-with-antialias-true-why/12381
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(1920, 1080);

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

    // useful lighting ref: https://stackoverflow.com/a/55937162
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1000;
    // make sure to add the camera to the scene or the weapon won't be visible.
    scene.add(camera);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);

    gltfLoader.load(
        // resource
        m4,
        // called when the resource is loaded
        function (gltf: {
            scene: THREE.Object3D<THREE.Event>;
            animations: any;
            scenes: any;
            cameras: any;
            asset: any;
        }) {
            const object = gltf.scene;

            object.traverse((c) => {
                c.castShadow = true;
            });

            object.scale.set(2, 2, 2);

            object.rotation.x = Math.PI / (1.99 / 8);

            object.position.x = 1;
            object.position.y = -1.2;
            object.position.z = -2.4;

            camera.add(object);

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        }
    );

    // Create a material for the ground. We'll use a basic material and set its color to white.
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb });
    // Create a geometry for the ground. This will be a large plane.
    // The first two parameters are the width and height of the plane.
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    // Create a mesh from the geometry and material, and add it to the scene.
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // start the ground plane at a low point so it doesn't clip through the objects.
    // we also don't want it at eye level with the camera.
    ground.position.y = startingGroundYPosition;
    console.log(ground.position.y);
    // Rotate the ground plane so it's horizontal.
    ground.rotation.x = -Math.PI / 2;
    // Add the ground to the scene.
    scene.add(ground);

    function getPlayerBreathingCameraOffset(): number {
        // Calculate bobbing offset based on sine wave
        let verticalOffset = Math.sin(breathingProgress) * breathingAmount;

        // Increment progress, reset to 0 if a full cycle has completed
        breathingProgress += breathingSpeed;
        if (breathingProgress > Math.PI * 2) {
            breathingProgress = 0.0;
        }

        return verticalOffset;
    }

    function getPlayerMovementGroundOffset(): number {
        // Calculate bobbing offset based on sine wave
        let verticalOffset = Math.sin(movementProgress) * movementAmount;
        console.log(verticalOffset);

        // Increment progress, reset to 0 if a full cycle has completed
        movementProgress += movementSpeed;
        if (movementProgress > Math.PI * 2) {
            movementProgress = 0.0;
        }

        return verticalOffset;
    }

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

        // account for player breathing
        y += getPlayerBreathingCameraOffset();

        // Update the camera's position.
        camera.position.set(x, y, z);
        // Make the camera point towards the object.
        camera.lookAt(objectPos);

        // The speed at which the ground moves (but it looks like the camera is moving)
        let moveSpeed = 2;

        // Adjust the ground position based on the user's input (and the camera settings).
        if (keys.w) {
            ground.position.x += moveSpeed * Math.sin(phiRad);
            ground.position.z += moveSpeed * Math.cos(phiRad);
            ground.position.y += getPlayerMovementGroundOffset();
        }
        if (keys.s) {
            ground.position.x -= moveSpeed * Math.sin(phiRad);
            ground.position.z -= moveSpeed * Math.cos(phiRad);
            ground.position.y += getPlayerMovementGroundOffset();
        }
        if (keys.a) {
            ground.position.x += moveSpeed * Math.cos(phiRad);
            ground.position.z -= moveSpeed * Math.sin(phiRad);
            // ground.position.y += getPlayerMovementGroundOffset();
        }
        if (keys.d) {
            ground.position.x -= moveSpeed * Math.cos(phiRad);
            ground.position.z += moveSpeed * Math.sin(phiRad);
            // sground.position.y += getPlayerMovementGroundOffset();
        }

        renderer.render(scene, camera);
    }
    animate();
}

main();
