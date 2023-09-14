import { GameController } from "./game-controller";

let gameController: GameController | undefined;

const domContentLoadedListener = (_event: Event) => {
  gameController = new GameController();
  gameController.start();
};

const unloadListener = (_event: Event) => {
  console.log("unload");
  window.removeEventListener("DOMContentLoaded", domContentLoadedListener);
  window.removeEventListener("unload", unloadListener);
};

window.addEventListener("DOMContentLoaded", domContentLoadedListener);
window.addEventListener("unload", unloadListener);
