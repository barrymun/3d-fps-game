import * as THREE from "three";

import nx from "./assets/nx.jpg";
import ny from "./assets/ny.jpg";
import nz from "./assets/nz.jpg";
import px from "./assets/px.jpg";
import py from "./assets/py.jpg";
import pz from "./assets/pz.jpg";
import { delay } from "./utils";
import { MovementController } from "./movement-controller";
import { WeaponController } from "./weapon-controller";
import { startingGroundYPosition } from "./constants";

const cubeTextureLoader = new THREE.CubeTextureLoader();

export class GameController {
  _renderer: THREE.WebGLRenderer | undefined;
  _scene: THREE.Scene | undefined;
  _camera: THREE.PerspectiveCamera | undefined;
  _ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined;

  getRenderer = () => {
    return this._renderer!;
  };

  getScene = () => {
    return this._scene!;
  };

  getCamera = () => {
    return this._camera!;
  };

  getGround = () => {
    return this._ground!;
  };

  setRenderer = (renderer: THREE.WebGLRenderer) => {
    if (this._renderer) return;
    this._renderer = renderer;
  };

  setScene = (scene: THREE.Scene) => {
    if (this._scene) return;
    this._scene = scene;
  };

  setCamera = (camera: THREE.PerspectiveCamera) => {
    if (this._camera) return;
    this._camera = camera;
  };

  setGround = (ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>) => {
    if (this._ground) return;
    this._ground = ground;
  };

  constructor() {
    this.loadRenderer();
    this.loadScene();
    this.loadCamera();
    this.loadGround();
    this.bindListeners();
  }

  private loadRenderer = () => {
    const canvas = document.querySelector("#c") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      // alpha: true,
      antialias: true,
    });
    // https://discourse.threejs.org/t/render-looks-blurry-and-pixelated-even-with-antialias-true-why/12381
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    this.setRenderer(renderer);
  };

  private loadScene = () => {
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

    this.setScene(scene);
  };

  private loadCamera = () => {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight; // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // make sure to add the camera to the scene or the weapon won't be visible.
    this.getScene().add(camera);

    this.setCamera(camera);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    this.getCamera().add(pointLight);

    this.getCamera().updateProjectionMatrix();
  };

  private loadGround = () => {
    // Create a material for the ground. We'll use a basic material and set its color to white.
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb });
    // Create a geometry for the ground. This will be a large plane.
    // The first two parameters are the width and height of the plane.
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    // Create a mesh from the geometry and material, and add it to the scene.
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // start the ground plane at a low point so it doesn't clip through the objects.
    // we also don't want it at eye level with the camera.
    ground.position.y = startingGroundYPosition;
    // Rotate the ground plane so it's horizontal.
    ground.rotation.x = -Math.PI / 2;
    // Add the ground to the scene.
    this.getScene().add(ground);

    this.setGround(ground);
  };

  public returnToStartingGroundPosition = async () => {
    if (this.getGround().position.y > startingGroundYPosition) {
      this.getGround().position.y -= 1.0;
      await delay(10);
      this.returnToStartingGroundPosition();
    }
  };

  public start = () => {
    const _mc = new MovementController(this);
    const _wc = new WeaponController(this);
    _wc.loadM4();
    _mc.start();
  };

  private handleResize = () => {
    this.getCamera().aspect = window.innerWidth / window.innerHeight;
    this.getCamera().updateProjectionMatrix();
    this.getRenderer().setSize(window.innerWidth, window.innerHeight);
  };

  private bindListeners = () => {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("unload", this.releaseListeners);
  };

  private releaseListeners = () => {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("unload", this.releaseListeners);
  };
}
