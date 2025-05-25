export class Buttons {
  constructor(game, controls) {
    this.game = game;
    this.controls = controls;
  }
  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.setupSkipButton();
    this.setupSleepButton();
    this.setupExploringButton();
  }

  setupSkipButton() {
    const skipButton = document.getElementById("skipToChallenges");
    if (skipButton) {
      skipButton.addEventListener("click", () => {
        this.game.showMarkerAt(places[3]);
      });
    }
  }
  //using player
  setupSleepButton() {
    const sleepBtn = document.getElementById("sleepBtn");
    if (sleepBtn) {
      sleepBtn.addEventListener("click", () => {
        if (typeof Player !== "undefined") {
          Player.rest();
          if (typeof places !== "undefined" && places[6]) {
            this.game.showMarkerAt(places[6]);
          }
        } else {
          console.warn("Player object not found");
        }
      });
    }
  }

  setupExploringButton() {
    const startExploringBtn = document.getElementById("startExploringBtn");
    if (startExploringBtn) {
      startExploringBtn.addEventListener("click", () => {
        this.controls.handleExploring();
      });
    }
  }

  updateUIForLocation(place, elements) {
    if (place.info === "Pavilion") {
      if (elements.sleepBtn) elements.sleepBtn.style.display = "block";
      if (elements.startExploringBtn)
        elements.startExploringBtn.style.display = "none";
    } else {
      if (elements.sleepBtn) elements.sleepBtn.style.display = "none";
      if (elements.startExploringBtn)
        elements.startExploringBtn.style.display = "block";
    }

    if (elements.cameraContainer)
      elements.cameraContainer.style.display = "none";
    elements.mapContainer.style.display = "block";
    if (elements.sceneBackground)
      elements.sceneBackground.style.display = "none";
  }
}
