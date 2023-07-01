import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import m4 from './assets/low-poly/m4.glb';
import { GameController } from './game-controller';

const gltfLoader = new GLTFLoader();

export class WeaponController {
    _gameController: GameController | undefined;

    getGameController = () => {
        return this._gameController!;
    };

    setGameController = (gameController: GameController) => {
        if (this._gameController) return;
        this._gameController = gameController;
    };

    constructor(gameController: GameController) {
        this.setGameController(gameController);
    }

    public loadM4 = () => {
        gltfLoader.load(
            // resource
            m4,
            // called when the resource is loaded
            (gltf: { scene: THREE.Object3D<THREE.Event>; animations: any; scenes: any; cameras: any; asset: any }) => {
                const object = gltf.scene;

                object.traverse((c) => {
                    c.castShadow = true;
                });

                object.scale.set(2, 2, 2);

                object.rotation.x = Math.PI / (1.99 / 8);

                object.position.x = 1;
                object.position.y = -1.2;
                object.position.z = -2.4;

                this.getGameController().getCamera().add(object);

                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Group
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object
            }
        );
    };
}
