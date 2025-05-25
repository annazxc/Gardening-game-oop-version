import { Controls } from "./controls.js";
import { Buttons } from "./buttons.js";
import { SeedCollection } from "./seed.js";

export class Game {
  constructor() {
    this.imageCache = new Map();
    this.playerName = null;
    this.isInitialized = false;
    this.currentLocation = null;

    this.controls = new Controls(this);
    this.buttons = new Buttons(this, this.controls);
    this.seedCollection = new SeedCollection(this.controls);

    // Bind methods to preserve 'this' context
    this.handleBeginAdventure = this.handleBeginAdventure.bind(this);
    this.onMarkerMove = this.onMarkerMove.bind(this);
    this.handleLocationExploration = this.handleLocationExploration.bind(this);
  }

  //initialize the game
  async initialize() {
    if (this.isInitialized) {
      console.warn("Game is already initialized");
      return;
    }

    try {
      await this.preloadLevelImages();
      this.playerName = this.promptForPlayerName();

      if (this.playerName) {
        this.savePlayerName(this.playerName);
        this.welcomePlayer(this.playerName);
      } else {
        this.handleNoName();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.showWarning(
        "Failed to load game resources. Please refresh the page."
      );
    }
  }

  // Callback for when marker position changes
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

    const threshold = 0.1; // Smaller threshold for proximity detection

    for (const id in places) {
      const place = places[id];
      if (place.level === position.level) {
        const dx = Math.abs(place.left - position.left);
        const dy = Math.abs(place.top - position.top);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < threshold) {
          return place;
        }
      }
    }
    return null;
  }

  // called by Controls
  handleLocationExploration(place, distance) {
    this.checkForDiscovery(place);

    // Show exploration message
    const message = `
      Exploring: ${place.info}
      Distance: ${distance.toFixed(2)} m
      
      After confirming, look for the Seed button
      and click quickly to collect seeds!
      ONE CLICK = ONE SEED`;

    if (confirm(message)) {
      this.seedCollection.createSeedButton();
      this.updatePlayerStatsForExploration(place);
    }
  }

  // Update player stats after exploration
  updatePlayerStatsForExploration(place) {
    try {
      const stats = this.getPlayerStats();
      if (
        stats &&
        typeof Player !== "undefined" &&
        Player.updateStaminaOnExplore
      ) {
        Player.updateStaminaOnExplore(5); // Costs 5 stamina to explore
      }
    } catch (error) {
      console.error("Error updating stats for exploration:", error);
    }
  }

  // Private method to prompt for player name
  promptForPlayerName() {
    const storedName = this.getStoredPlayerName();

    if (storedName) {
      if (confirm(`Welcome back! Continue as ${storedName}?`)) {
        return storedName;
      }
    }

    const name = prompt("What is your name, brave explorer?");
    return name ? name.trim() : null;
  }

  // Private method to get stored player name
  getStoredPlayerName() {
    try {
      return localStorage.getItem("playerName");
    } catch (error) {
      console.warn("Unable to access localStorage:", error);
      return null;
    }
  }

  // Private method to save player name
  savePlayerName(name) {
    try {
      localStorage.setItem("playerName", name);
    } catch (error) {
      console.warn("Unable to save to localStorage:", error);
    }
  }

  // Private method to create welcome modal
  welcomePlayer(name) {
    const welcomeModal = this.createWelcomeModal(name);
    document.body.appendChild(welcomeModal);

    const beginButton = document.getElementById("begin-adventure");
    if (beginButton) {
      beginButton.addEventListener("click", this.handleBeginAdventure);
    }

    // Initialize player stats using dependency injection pattern
    if (typeof Player !== "undefined" && Player.initializePlayerStats) {
      Player.initializePlayerStats(name);
    }
  }

  // Private method to create welcome modal DOM element
  createWelcomeModal(name) {
    const welcomeModal = document.createElement("div");
    welcomeModal.className = "welcome-modal";
    welcomeModal.innerHTML = `
      <div class="welcome-content">
        <h2>Welcome, ${this.escapeHtml(name)}!</h2>
        <p>Down the rabbit hole you go!<br>Let the adventure begin!</p>    
        <div class="game-tips">
          <h3>Adventurer's Tips:</h3>
          <ul>
            <li>A little rest in the cabin, and your strength shall bloom anew</li>
            <li>Changing scenes costs stamina — so dive deep into each place before moving on.</li>
            <li>Mark your wonders on the map as you go</li>
            <li>Use arrow keys to move, Enter or Space to explore</li>
          </ul>
        </div>
        <div class="character-stats">
          <h3>Initial Stats:</h3>
          <p>Health: 100/100</p>
          <p>Stamina: 50/50</p>
          <p>Backpack: Seeds, Map, Notebook</p>
        </div>
        <button id="begin-adventure">Begin Your Quest</button>
      </div>
    `;
    return welcomeModal;
  }

  // Private method to handle begin adventure button click
  handleBeginAdventure() {
    const welcomeModal = document.querySelector(".welcome-modal");
    if (welcomeModal) {
      welcomeModal.classList.add("fade-out");
      setTimeout(() => {
        if (welcomeModal.parentNode) {
          welcomeModal.parentNode.removeChild(welcomeModal);
        }
        // Setup controls after welcome modal is dismissed
        this.setupGameControls();
      }, 1000);
    }
  }

  // Setup game controls after initialization
  setupGameControls() {
    setTimeout(() => {
      if (this.controls.setupControls()) {
        console.log("Game controls initialized successfully");
      } else {
        console.error("Failed to initialize game controls");
        this.showWarning(
          "Failed to setup game controls. Please refresh the page."
        );
      }
    }, 100);
  }

  // Private method to handle case when no name is provided
  handleNoName() {
    const defaultName = "Mysterious Explorer";
    this.playerName = defaultName;
    this.savePlayerName(defaultName);
    this.welcomePlayer(defaultName);
  }

  // Public method to show general messages
  showMessage(message, duration = 3000) {
    if (!message) return;

    const messageBox = this.createMessageBox(message, "message-box");
    this.displayTemporaryElement(messageBox, duration);
  }

  // Public method to show warning messages
  showWarning(message, duration = 3000) {
    if (!message) return;

    const warningBox = this.createMessageBox(message, "warning-box");
    this.displayTemporaryElement(warningBox, duration);
  }

  // Private method to create message box elements
  createMessageBox(message, className) {
    const messageBox = document.createElement("div");
    messageBox.className = className;
    messageBox.textContent = message;
    return messageBox;
  }

  // Private method to display temporary elements
  displayTemporaryElement(element, duration) {
    document.body.appendChild(element);

    setTimeout(() => {
      element.classList.add("fade-out");
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 1000);
    }, duration);
  }

  // Public method to show location name
  showLocationName(locationName) {
    if (!locationName) return;

    let locationDisplay = document.getElementById("location-display");

    if (!locationDisplay) {
      locationDisplay = this.createLocationDisplay();
      const gameContainer =
        document.querySelector(".game-container") || document.body;
      gameContainer.appendChild(locationDisplay);
    }

    locationDisplay.textContent = locationName;
    locationDisplay.classList.add("show");

    setTimeout(() => {
      locationDisplay.classList.remove("show");
    }, 3000);
  }

  // Private method to create location display element
  createLocationDisplay() {
    const locationDisplay = document.createElement("div");
    locationDisplay.id = "location-display";
    locationDisplay.className = "location-display";
    return locationDisplay;
  }

  // Public method to show discovery notifications
  showDiscovery(locationName) {
    if (!locationName) return;

    const discoveryBox = document.createElement("div");
    discoveryBox.className = "discovery-box";
    discoveryBox.innerHTML = `
      <h3>New Discovery!</h3>
      <p>You've discovered: ${this.escapeHtml(locationName)}</p>
    `;

    this.displayTemporaryElement(discoveryBox, 4000);
  }

  // Public method to check for new discoveries
  checkForDiscovery(place) {
    if (!place?.info) return;

    try {
      const stats = this.getPlayerStats();
      if (!stats) return;

      if (!stats.discoveries.includes(place.info)) {
        stats.discoveries.push(place.info);
        this.savePlayerStats(stats);
        this.showDiscovery(place.info);
      }
    } catch (error) {
      console.error("Error checking for discovery:", error);
    }
  }

  // Private method to get player stats
  getPlayerStats() {
    try {
      const statsData = localStorage.getItem("playerStats");
      return statsData ? JSON.parse(statsData) : null;
    } catch (error) {
      console.error("Error parsing player stats:", error);
      return null;
    }
  }

  // Private method to save player stats
  savePlayerStats(stats) {
    try {
      localStorage.setItem("playerStats", JSON.stringify(stats));
    } catch (error) {
      console.error("Error saving player stats:", error);
    }
  }

  // Private method to preload a single image
  preloadImage(src) {
    if (this.imageCache.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Public method to preload all level images
  async preloadLevelImages() {
    const imageSources = [
      "assets/images/level_0.png",
      "assets/images/level_1.png",
      "assets/images/level_2.png",
    ];

    try {
      await Promise.all(imageSources.map((src) => this.preloadImage(src)));
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
      const elements = this.getRequiredElements();
      if (!this.validateElements(elements)) return;

      this.initializePlayerStatsIfNeeded();
      this.updatePlayerMovement();
      this.updateMarkerPosition(place, elements);

      this.buttons.updateUIForLocation(place, elements);

      this.setupPostMoveControls(elements.mapContainer);
      this.checkForDiscovery(place);
    } catch (error) {
      console.error("Error showing marker:", error);
      this.showWarning("Error updating location. Please try again.");
    }
  }

  // Private method to get required DOM elements
  getRequiredElements() {
    return {
      marker: document.getElementById("marker"),
      mapContainer: document.getElementById("map-container"),
      cameraContainer: document.getElementById("camera-container"),
      map: document.getElementById("map"),
      sleepBtn: document.getElementById("sleepBtn"),
      startExploringBtn: document.getElementById("startExploringBtn"),
      sceneBackground: document.getElementsByClassName("scene-background")[0],
    };
  }

  // Private method to validate required elements exist
  validateElements(elements) {
    const requiredElements = ["marker", "mapContainer", "map"];
    for (const elementName of requiredElements) {
      if (!elements[elementName]) {
        console.error(`Required element '${elementName}' is missing`);
        return false;
      }
    }
    return true;
  }

  // Private method to initialize player stats if needed
  initializePlayerStatsIfNeeded() {
    if (!localStorage.getItem("playerStats")) {
      if (typeof Player !== "undefined" && Player.initializePlayerStats) {
        Player.initializePlayerStats("Explorer");
      }
    }
  }

  // -5 stamina per move
  updatePlayerMovement() {
    if (typeof Player !== "undefined" && Player.updateStaminaOnMove) {
      Player.updateStaminaOnMove();
    }
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

  // Private method to setup controls after moving
  setupPostMoveControls(mapContainer) {
    setTimeout(() => {
      // Setup controls through our Controls class
      this.controls.setupControls();
    }, 100);
  }

  // Utility method to escape HTML to prevent XSS (Cross-Site Scripting)
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Public method to get current player name
  getPlayerName() {
    return this.playerName;
  }

  // Public method to check if game is initialized
  isGameInitialized() {
    return this.isInitialized;
  }

  // Public method to get controls instance
  getControls() {
    return this.controls;
  }

  // Public method to reset game state
  reset() {
    this.imageCache.clear();
    this.playerName = null;
    this.isInitialized = false;
    this.currentLocation = null;
    this.controls.reset();
  }
}
