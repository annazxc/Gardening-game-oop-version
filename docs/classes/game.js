import { Controls } from "./controls.js";
import { Buttons } from "./buttons.js";
import { SeedCollection } from "./seed.js";
import { Storyteller } from "./storyteller.js";
import { places } from "../js/data.js";
import {
  displayTemporaryElement,
  escapeHtml,
  preloadImages,
  calculateDistance,
} from "../js/utils.js";

export class Game {
  constructor() {
    this.imageCache = new Map(); //built-in object {key:value}pair
    //Preserves insertion order
    //Key types	:Any type (objects, functions, etc.)
    //{} object -> key type only strings
    this.playerName = null;
    this.isInitialized = false;

    this.controls = new Controls(this);
    this.buttons = new Buttons(this, this.controls);
    this.buttons.init();
    this.seedCollection = new SeedCollection(this.controls);
    this.seedCollection.initialize();

    this.storyteller = new Storyteller();
    this.storyteller.init();

    // Bind methods to preserve 'this' context
    this.handleBeginAdventure = this.handleBeginAdventure.bind(this);
    this.onMarkerMove = this.onMarkerMove.bind(this); //call by controls
    this.handleLocationExploration = this.handleLocationExploration.bind(this);
  }

  async initialize() {
    if (this.isInitialized) {
      console.warn("Game is already initialized");
      return;
    }

    try {
      await this.preloadLevelImages();
      this.playerName = this.promptForPlayerName();

      if (this.playerName) {
        localStorage.setItem("playerName", this.playerName);
        this.welcomePlayer(this.playerName);
      } else {
        this.handleNoName();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  }

  // called by control, when marker position changes
  onMarkerMove(position) {
    this.currentLocation = this.checkNearbyLocation(position);

    // Add seed collection check if initialized
    if (this.seedCollection && this.seedCollection.isInitialized) {
      this.seedCollection.checkForSeedCollection();
    }
  }

  // Check for locations near the given position
  checkNearbyLocation(position) {
    if (typeof places === "undefined") return null;

    const threshold = 0.3; //30% of parent container

    for (const id in places) {
      const place = places[id];
      if (place.level === position.level) {
        const distance = calculateDistance(place, position);

        if (distance < threshold) {
          return place;
        }
      }
    }
    return null;
  }

  // called by Controls
  handleLocationExploration(place, distance) {
    this.showDiscovery(place.info);

    // Show exploration message
    const message = `
      Exploring: ${place.info}
      Distance: ${distance.toFixed(2)} m
      
      After confirming, look for the Seed button
      and click quickly to collect seeds!
      ONE CLICK = ONE SEED`;

    if (confirm(message)) {
      this.seedCollection.createSeedButton();
    }
  }

  promptForPlayerName() {
    const storedName = localStorage.getItem("playerName");

    if (storedName) {
      if (confirm(`Welcome back! Continue as ${storedName}?`)) {
        return storedName;
      }
    }
    const name = prompt("What is your name, brave explorer?");
    return name ? name.trim() : null;
  }

  welcomePlayer(name) {
    const welcomeModal = this.createWelcomeModal(name);
    document.body.appendChild(welcomeModal);

    const beginButton = document.getElementById("begin-adventure");
    if (beginButton) {
      beginButton.addEventListener("click", this.handleBeginAdventure);
    }
  }

  //create welcome modal DOM element
  createWelcomeModal(name) {
    const welcomeModal = document.createElement("div");
    welcomeModal.className = "welcome-modal";
    welcomeModal.innerHTML = `
      <div class="welcome-content">
        <h2>Welcome, ${escapeHtml(name)}!</h2>
        <p>Down the rabbit hole you go!<br>Let the adventure begin!</p>    
        <div class="game-tips">
          <h3>Adventurer's Tips:</h3>
          <ul>
            <li>A little rest in the cabin, and your strength shall bloom anew</li>
            <li>Mark your wonders on the map as you go</li>
            <li>Use arrow keys to move</li>
          </ul>
        </div>
        <button id="begin-adventure">Begin Your Quest</button>
      </div>
    `;
    return welcomeModal;
  }

  //handle begin adventure button click
  handleBeginAdventure() {
    const welcomeModal = document.querySelector(".welcome-modal");
    if (welcomeModal) {
      displayTemporaryElement(welcomeModal, 500);
      this.setupGameControls();
    }
  }

  //after initialization
  setupGameControls() {
    setTimeout(() => {
      if (this.controls.setupControls()) {
        console.log("Game controls initialized successfully");
      } else {
        console.error("Failed to initialize game controls");
      }
    }, 100);
  }

  //handle case when no name is provided
  handleNoName() {
    const defaultName = "Mysterious Explorer";
    this.playerName = defaultName;
    localStorage.setItem("playerName", defaultName);
    this.welcomePlayer(defaultName);
  }

  //show discovery notifications
  showDiscovery(locationName) {
    if (!locationName) return;

    const discoveryBox = document.createElement("div");
    discoveryBox.className = "discovery-box";
    discoveryBox.innerHTML = `
      <h3>New Discovery!</h3>
      <p>You've discovered: ${escapeHtml(locationName)}</p>
    `;
    document.body.appendChild(discoveryBox);

    displayTemporaryElement(discoveryBox, 3000);
  }

  async preloadLevelImages() {
    const imageSources = [
      "assets/images/level_0.png",
      "assets/images/level_1.png",
      "assets/images/level_2.png",
    ];

    try {
      await preloadImages(imageSources, this.imageCache);
      console.log("All level images preloaded successfully");
    } catch (error) {
      console.error("Error preloading images:", error);
      throw error;
    }
  }

  showMarkerAt(place) {
    if (!place) {
      console.error("Place data is missing");
      return;
    }

    try {
      const footer = document.querySelector("footer");
      if (footer) {
        footer.style.display = "none"; //footer covered the start exploring button
      }

      const elements = this.getRequiredElements();
      this.updateMarkerPosition(place, elements);

      this.buttons.updateUIForLocation(place, elements);
      this.controls.setupControls();
      this.showDiscovery(place.info);
    } catch (error) {
      console.error("Error showing marker:", error);
    }
  }

  // get required DOM elements
  getRequiredElements() {
    return {
      marker: document.getElementById("marker"),
      mapContainer: document.getElementById("map-container"),
      map: document.getElementById("map"),
      sleepBtn: document.getElementById("sleepBtn"),
      startExploringBtn: document.getElementById("startExploringBtn"),
      sceneBackground: document.getElementsByClassName("scene-background")[0],
    };
  }

  updateMarkerPosition(place, elements) {
    // Update Controls class position
    this.controls.setMarkerPosition({
      top: place.top,
      left: place.left,
      level: place.level,
    });

    elements.map.src = `assets/images/level_${place.level}.png`;
    // Re-append audio controls
    if (this.audioController && this.audioController.audioControlContainer) {
      document.body.appendChild(this.audioController.audioControlContainer);
    }
  }

  reset() {
    this.imageCache.clear();
    this.playerName = null;
    this.isInitialized = false;
    this.controls.reset();
  }
}
