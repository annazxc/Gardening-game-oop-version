import { Game } from "../classes/game.js";
import { QRScanner } from "../classes/scanner.js";

document.addEventListener("DOMContentLoaded", () => {
  alert(`Welcome!  
    To access different places in the game, you need a QR code. 
    Use the one in the folder --> extra/QR.png 
    or generate your own.

    Alternatively, click skip to challenges button.
    
    Only QR codes containing numbers from 1 to 6 are supported,
    other values wouldn't work.
    `);

  const game = new Game();
  game.initialize();
  const qrScanner = new QRScanner(game);
  const placeBtn = document.getElementById("placeBtn");
  placeBtn.addEventListener("click", () => {
    qrScanner.toggleScanner();
  });
});
