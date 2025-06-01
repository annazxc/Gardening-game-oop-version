import { SlotMachine } from "../classes/slotMachine.js";
import { PlantingManager } from "../classes/plantingManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const plantingManager = new PlantingManager();
  plantingManager.initialize();
  const slot = document.getElementById("launchSlotMachine");
  slot.addEventListener("click", () => {
    const machine = new SlotMachine(plantingManager);
    machine.show();
  });
});
