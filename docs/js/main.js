import { PoemGenerator } from "../classes.poem.js";
import { Controls } from "../classes.controls.js";

export class Application {
  constructor(game) {
    this.game = game;
    this.controls = null;
    this.poemGenerator = null;
    this.locationMap = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) {
      console.warn("Application already initialized");
      return;
    }

    try {
      this.initializeSystems();
      this.initializeComponents();

      this.isInitialized = true;
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
    }
  }

  initializeComponents() {
    this.controls = new Controls();
    this.poemGenerator = new PoemGenerator();

    // Initialize location map if the class exists
    if (typeof LocationMap !== "undefined") {
      this.locationMap = new LocationMap();
    }
  }

  initializeSystems() {
    // Setup controls
    if (this.controls) {
      this.controls.setupControls();
    }

    // Initialize seed collection system
    if (typeof SeedCollection !== "undefined") {
      SeedCollection.initSeedCollectionSystem();
    }

    // Initialize location map
    if (this.locationMap) {
      this.locationMap.init();
    }

    // Initialize storyteller system with delay
    setTimeout(() => {
      if (typeof initStorytellerSystem === "function") {
        initStorytellerSystem();
      }
    }, 1000);
  }

  /**
   * Cleanup method for proper resource management
   */
  destroy() {
    // Add cleanup logic here if needed
    this.isInitialized = false;
    console.log("Application destroyed");
  }
}
