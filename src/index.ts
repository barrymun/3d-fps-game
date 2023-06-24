import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import manGltf from './assets/man.gltf';
import manBin from './assets/man.bin';
import manJpg from './assets/man.jpg';
import nx from './assets/nx.jpg';
import ny from './assets/ny.jpg';
import nz from './assets/nz.jpg';
import px from './assets/px.jpg';
import py from './assets/py.jpg';
import pz from './assets/pz.jpg';

const gltfLoader = new GLTFLoader();
const fileLoader = new THREE.FileLoader();
const imageLoader = new THREE.ImageLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const speed: number = 0.01;

let model: THREE.Group | undefined;

// Initialize the camera's spherical coordinates.
let radius = 10; // The distance from the object.

// Set theta to 90 degrees to start looking straight ahead.
let theta = 90; // The angle down from the y-axis.
let phi = 0; // The angle around the y-axis.

// The object's position.
let objectPos = new THREE.Vector3(0, 0, 0);

// The speed at which the camera rotates in degrees (adjust as needed).
let rotationSpeed = 1;

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
};

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
            keys.down = true;
            break;
        case 'ArrowLeft':
        case 'a':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
            keys.down = false;
            break;
        case 'ArrowLeft':
        case 'a':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            keys.right = false;
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
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();

    // const texture = cubeTextureLoader.load([
    //     nx, ny,
    //     nz, px,
    //     py, pz,
    // ]);
    const texture = cubeTextureLoader.load([
        px, // right
        nx, // left
        py, // top
        ny, // bottom
        pz, // back
        nz, // front
    ]);
    scene.background = texture;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
    const model = new THREE.Mesh(geometry, material);
    scene.add(model);
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // gltfLoader.load(
    //     manGltf,
    //     function (gltf) {
    //         model = gltf.scene; // Save the loaded model.
    //         scene.add(model);
    //     },
    //     undefined,
    //     function (error) {
    //         console.error(error);
    //     }
    // );

    // fileLoader.load(
    //     manBin,
    //     // onLoad callback
    //     function (data) {
    //         // output the text to the console
    //         // console.log( data )
    //     },

    //     // onProgress callback
    //     function (xhr) {
    //         console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    //     },

    //     // onError callback
    //     function (err) {
    //         console.error('An error happened');
    //     }
    // );

    // imageLoader.load(
    //     manJpg,
    //     // onLoad callback
    //     function (image) {
    //         // use the image, e.g. draw part of it on a canvas
    //         const canvas = document.createElement('canvas');
    //         const context = canvas.getContext('2d');
    //         context.drawImage(image, 100, 100);
    //     },

    //     // onProgress callback currently not supported
    //     undefined,

    //     // onError callback
    //     function () {
    //         console.error('An error happened.');
    //     }
    // );

    // function render(time: number) {
    //     time *= 0.001; // convert time to seconds

    //     // cube.rotation.x = time;
    //     // cube.rotation.y = time;

    //     renderer.render(scene, camera);

    //     requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);

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

        renderer.render(scene, camera);
    }
    animate();
}

main();
