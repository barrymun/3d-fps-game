import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import manGltf from './assets/man.gltf';
import manBin from './assets/man.bin';
import manJpg from './assets/man.jpg';

const gltfLoader = new GLTFLoader();
const fileLoader = new THREE.FileLoader();
const imageLoader = new THREE.ImageLoader();

function main() {
    const canvas = document.querySelector('#c') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
    });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    gltfLoader.load(
        manGltf,
        function (gltf) {
            scene.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

    fileLoader.load(
        manBin,
        // onLoad callback
        function (data) {
            // output the text to the console
            // console.log( data )
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
        }
    );

    imageLoader.load(
        manJpg,
        // onLoad callback
        function (image) {
            // use the image, e.g. draw part of it on a canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.drawImage(image, 100, 100);
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function () {
            console.error('An error happened.');
        }
    );

    function render(time: number) {
        time *= 0.001; // convert time to seconds

        // cube.rotation.x = time;
        // cube.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();
