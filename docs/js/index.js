import { AudioController } from "../classes/audioControl.js";

let audioController; //fix scope issue(audioController globally accessible)
document.addEventListener("DOMContentLoaded", () => {
  audioController = new AudioController();
  audioController.init();
});
