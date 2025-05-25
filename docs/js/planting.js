import { SlotMachine } from "../classes/slotMachine.js";

document.addEventListener("DOMContentLoaded", () => {
  localStorage.clear();
  const slot = document.getElementById("launchSlotMachine");
  slot.addEventListener("click", () => {
    const machine = new SlotMachine();
    machine.show();
    const reels = document.querySelectorAll(".slot-reel");
    machine.reels = Array.from(reels);
    machine.resultDisplay = document.getElementById("result-display");
    machine.spin();
  });
});
