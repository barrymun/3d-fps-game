import * as THREE from 'three';

import { GameController } from './game-controller';

const breathingSpeed: number = 0.02;
const breathingAmount: number = 0.2;
const movementSpeed: number = 0.04; // This will control how fast the bobbing effect happens
const movementAmount: number = 0.3; // This will control how much the camera bobs up and down

// Initialize the camera's spherical coordinates.
let radius = 10; // The distance from the object.

// Set theta to 90 degrees to start looking straight ahead.
let theta = 90; // The angle down from the y-axis.
let phi = 0; // The angle around the y-axis.

// The object's position.
let objectPos = new THREE.Vector3(0, 0, 0);

// The speed at which the camera rotates in degrees (adjust as needed).
let rotationSpeed = 1;

export type MovementKeys = { [key in string]: boolean };

export class MovementController {
    _gameController: GameController | undefined;
    _keys: MovementKeys = {
        up: false,
        down: false,
        left: false,
        right: false,
        w: false,
        s: false,
        a: false,
        d: false,
    };
    _breathingProgress: number = 0.0;
    _movementProgress: number = 0.0; // This will keep track of the progress through the bobbing pattern

    getGameController = () => {
        return this._gameController!;
    };

    public getKeys = (): MovementKeys => {
        return this._keys!;
    };

    setGameController = (gameController: GameController) => {
        if (this._gameController) return;
        this._gameController = gameController;
    };

    constructor(gameController: GameController) {
        this.setGameController(gameController);
        this.bindListeners();
    }

    private getPlayerBreathingCameraOffset = (): number => {
        // Calculate bobbing offset based on sine wave
        let verticalOffset = Math.sin(this._breathingProgress) * breathingAmount;

        // Increment progress, reset to 0 if a full cycle has completed
        this._breathingProgress += breathingSpeed;
        if (this._breathingProgress > Math.PI * 2) {
            this._breathingProgress = 0.0;
        }

        return verticalOffset;
    };

    private getPlayerMovementGroundOffset = (): number => {
        // Calculate bobbing offset based on sine wave
        let verticalOffset = Math.sin(this._movementProgress) * movementAmount;

        // Increment progress, reset to 0 if a full cycle has completed
        this._movementProgress += movementSpeed;
        if (this._movementProgress > Math.PI * 2) {
            this._movementProgress = 0.0;
        }

        return verticalOffset;
    };

    private handleMovementStart = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                this.getKeys().up = true;
                break;
            case 'ArrowDown':
                this.getKeys().down = true;
                break;
            case 'ArrowLeft':
                this.getKeys().left = true;
                break;
            case 'ArrowRight':
                this.getKeys().right = true;
                break;
            case 'w':
                this.getKeys().w = true;
                break;
            case 's':
                this.getKeys().s = true;
                break;
            case 'a':
                this.getKeys().a = true;
                break;
            case 'd':
                this.getKeys().d = true;
                break;
        }
    };

    private handleMovementEnd = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                this.getKeys().up = false;
                break;
            case 'ArrowDown':
                this.getKeys().down = false;
                break;
            case 'ArrowLeft':
                this.getKeys().left = false;
                break;
            case 'ArrowRight':
                this.getKeys().right = false;
                break;
            case 'w':
                this.getKeys().w = false;
                this._movementProgress = 0.0;
                this.getGameController().returnToStartingGroundPosition();
                break;
            case 's':
                this.getKeys().s = false;
                this._movementProgress = 0.0;
                this.getGameController().returnToStartingGroundPosition();
                break;
            case 'a':
                this.getKeys().a = false;
                break;
            case 'd':
                this.getKeys().d = false;
                break;
        }
    };

    public start = () => {
        requestAnimationFrame(this.start);

        // Adjust the camera's spherical coordinates based on the user's input.
        if (this.getKeys().up) theta += rotationSpeed;
        if (this.getKeys().down) theta -= rotationSpeed;
        if (this.getKeys().left) phi += rotationSpeed;
        if (this.getKeys().right) phi -= rotationSpeed;

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
        y += this.getPlayerBreathingCameraOffset();

        // Update the camera's position.
        this.getGameController().getCamera().position.set(x, y, z);
        // Make the camera point towards the object.
        this.getGameController().getCamera().lookAt(objectPos);

        // The speed at which the ground moves (but it looks like the camera is moving)
        let moveSpeed = 2;

        // Adjust the ground position based on the user's input (and the camera settings).
        if (this.getKeys().w) {
            this.getGameController().getGround().position.x += moveSpeed * Math.sin(phiRad);
            this.getGameController().getGround().position.z += moveSpeed * Math.cos(phiRad);
        }
        if (this.getKeys().s) {
            this.getGameController().getGround().position.x -= moveSpeed * Math.sin(phiRad);
            this.getGameController().getGround().position.z -= moveSpeed * Math.cos(phiRad);
        }
        if (this.getKeys().a) {
            this.getGameController().getGround().position.x += moveSpeed * Math.cos(phiRad);
            this.getGameController().getGround().position.z -= moveSpeed * Math.sin(phiRad);
        }
        if (this.getKeys().d) {
            this.getGameController().getGround().position.x -= moveSpeed * Math.cos(phiRad);
            this.getGameController().getGround().position.z += moveSpeed * Math.sin(phiRad);
        }

        if (this.getKeys().w || this.getKeys().s) {
            this.getGameController().getGround().position.y += this.getPlayerMovementGroundOffset();
        }

        this.getGameController()
            .getRenderer()
            .render(this.getGameController().getScene(), this.getGameController().getCamera());
    };

    private bindListeners = () => {
        window.addEventListener('keydown', this.handleMovementStart);
        window.addEventListener('keyup', this.handleMovementEnd);
        window.addEventListener('unload', this.releaseListeners);
    };

    private releaseListeners = () => {
        window.removeEventListener('keydown', this.handleMovementStart);
        window.removeEventListener('keyup', this.handleMovementEnd);
    };
}
