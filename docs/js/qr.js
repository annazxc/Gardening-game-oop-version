import { Game } from "../classes/game.js";
import { QRScanner } from "../classes/scanner.js";
import { Buttons } from "../classes/buttons.js";

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  game.initialize();
  const qrScanner = new QRScanner(game);
  const placeBtn = document.getElementById("placeBtn");
  placeBtn.addEventListener("click", () => {
    qrScanner.toggleScanner();
  });
});
