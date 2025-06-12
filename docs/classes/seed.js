import { NotebookManager } from "./notebook.js";
import { phrases } from "../js/data.js";
import { createElement } from "../js/utils.js";
export class SeedCollection {
  constructor(controls) {
    this.collectedWords = [];
    this.collectedPhrases = [];
    this.activeSeeds = new Set();
    this.seedTimeout = null;
    this.isInitialized = false;
    this.controls = controls;

    this.phrases = phrases; //phrases in data.js
    this.notebookManager = new NotebookManager();

    this.config = {
      seedButtonTimeout: 3000,
      seedLifetime: 15000,
      bounceSpeed: 5,
      audioPath: "assets/audio/seed_collect.mp3",
    };
  }

  initialize() {
    if (this.isInitialized) {
      console.warn("SeedCollection already initialized");
      return;
    }

    this.initSeedCollectionSystem();
    this.isInitialized = true;
  }

  createSeedButton() {
    const seedButton = createElement(
      "button", //tag
      {
        className: "btn btn-primary", //attribute
        id: "seedButton",
      },
      "Click for Seeds" //textContent
    );

    this.applySeedButtonStyles(seedButton);
    this.attachSeedButtonToContainer(seedButton);
    this.setupSeedButtonBehavior(seedButton);
    this.scheduleSeedButtonRemoval(seedButton);
  }

  applySeedButtonStyles(button) {
    const styles = {
      display: "inline-block",
      position: "absolute",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
    };

    Object.assign(button.style, styles);
  }

  attachSeedButtonToContainer(button) {
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.appendChild(button);
    } else {
      throw new Error("Map container not found");
    }
  }

  setupSeedButtonBehavior(button) {
    button.onclick = () => this.createBouncingWords();
  }

  scheduleSeedButtonRemoval(button) {
    setTimeout(() => {
      const mapContainer = document.getElementById("map-container");
      if (mapContainer && mapContainer.contains(button)) {
        mapContainer.removeChild(button);
      }
    }, this.config.seedButtonTimeout);
  }

  initSeedCollectionSystem() {
    console.log("Seed collection system initialized");
  }

  // Check for seed collection on player movement
  checkForSeedCollection() {
    console.log("Checking for seed collection...");

    const playerRect = this.getPlayerRect();
    console.log("Player rect:", playerRect);

    if (!playerRect) {
      console.log("No player rect found");
      return;
    }

    console.log("Active seeds count:", this.activeSeeds.size);

    this.activeSeeds.forEach((seed) => {
      const seedRect = seed.getBoundingClientRect();
      console.log("Checking seed at:", seedRect);

      if (this.rectsIntersect(seedRect, playerRect)) {
        console.log("Collision detected!");
        this.collectSeed(seed);
      }
    });
  }

  // Check if two rectangles intersect
  rectsIntersect(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  // Collect a seed
  collectSeed(seedElement) {
    const word = seedElement.textContent;
    this.collectedWords.push(word);
    this.playSeedCollectSound();
    this.removeSeed(seedElement);
    this.checkForCompletedPhrases();
  }

  // Remove seed from DOM and tracking
  removeSeed(seedElement) {
    this.activeSeeds.delete(seedElement);
    seedElement.remove();
  }

  // Play sound when seed is collected
  playSeedCollectSound() {
    try {
      const audio = new Audio(this.config.audioPath);
      audio.play().catch((error) => {
        console.log("Error playing sound:", error);
      });
    } catch (error) {
      console.log("Error creating audio:", error);
    }
  }

  // Create bouncing words from a random phrase
  createBouncingWords() {
    const randomPhrase = this.getRandomPhrase();
    const words = randomPhrase.split(" ");

    words.forEach((word) => this.createBouncingSeed(word, randomPhrase));
    this.scheduleSeedCleanup();
  }

  // Create individual bouncing seed
  createBouncingSeed(word, originalPhrase) {
    const seedElement = createElement(
      "div",
      {
        className: "bouncing-seed",
      },
      word
    );

    seedElement.dataset.originalPhrase = originalPhrase;

    const position = this.generateRandomPosition();
    const velocity = this.generateRandomVelocity();

    this.applySeedPosition(seedElement, position, velocity);
    this.attachSeedToContainer(seedElement);
    this.activeSeeds.add(seedElement);

    const animation = new SeedAnimation(seedElement, position, velocity);
    animation.start();
  }

  //for seed
  generateRandomPosition() {
    return {
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 50),
    };
  }

  //for seed
  generateRandomVelocity() {
    return {
      vx: (Math.random() - 0.5) * this.config.bounceSpeed,
      vy: (Math.random() - 0.5) * this.config.bounceSpeed,
    };
  }

  // Apply position and velocity to seed
  applySeedPosition(element, position, velocity) {
    element.style.position = "absolute";
    element.style.left = position.x + "px";
    element.style.top = position.y + "px";
    element.dataset.vx = velocity.vx;
    element.dataset.vy = velocity.vy;
  }

  attachSeedToContainer(seedElement) {
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.appendChild(seedElement);
    }
  }

  scheduleSeedCleanup() {
    // Clear any existing timeout first
    if (this.seedTimeout) {
      clearTimeout(this.seedTimeout);
    }

    this.seedTimeout = setTimeout(() => {
      this.cleanupRemainingSeeds();
      this.showCompletionMessage();
      // Clear the timeout reference after use
      this.seedTimeout = null;
    }, this.config.seedLifetime);
  }

  cleanupRemainingSeeds() {
    this.activeSeeds.forEach((seed) => seed.remove());
    this.activeSeeds.clear();
  }

  // Show completion message and notebook
  showCompletionMessage() {
    // Only show if we haven't already shown it
    if (this.seedTimeout !== null) {
      alert(`Time's up! 
Feeling Good?`);

      localStorage.setItem("words", JSON.stringify(this.collectedWords));
      localStorage.setItem("phrases", JSON.stringify(this.collectedPhrases));

      this.notebookManager.showCollectionNotebook();

      // Mark as completed
      this.seedTimeout = null;
    }
  }

  getRandomPhrase() {
    return this.phrases[Math.floor(Math.random() * this.phrases.length)];
  }

  // Check for completed phrases
  checkForCompletedPhrases() {
    const collectedWordsSet = new Set(this.collectedWords);

    this.phrases.forEach((phrase) => {
      if (
        !this.collectedPhrases.includes(phrase) &&
        this.isPhraseComplete(phrase, collectedWordsSet)
      ) {
        this.markPhraseAsComplete(phrase);
      }
    });
  }

  // Check if phrase is complete
  isPhraseComplete(phrase, collectedWordsSet) {
    const phraseWords = this.cleanPhrase(phrase).split(" ");

    return phraseWords.every((word) =>
      this.isWordCollected(word, collectedWordsSet)
    );
  }

  // Clean phrase of punctuation
  cleanPhrase(phrase) {
    return phrase.toLowerCase().replace(/[.,!?]/g, "");
  }

  // Check if word is collected (with punctuation variants)
  isWordCollected(word, collectedWordsSet) {
    const punctuations = ["", ".", ",", "!", "?"];
    return punctuations.some((punct) => collectedWordsSet.has(word + punct));
  }

  // Mark phrase as complete
  markPhraseAsComplete(phrase) {
    this.collectedPhrases.push(phrase);
    this.showPhraseCompletionAlert(phrase);
  }

  // Show phrase completion alert
  showPhraseCompletionAlert(phrase) {
    alert(`Congratulations!
You've collected all words for the phrase: 
${phrase}`);
  }

  // Get player rectangle
  getPlayerRect() {
    const playerMarker = document.getElementById("marker");
    return playerMarker ? playerMarker.getBoundingClientRect() : null;
  }

  // Reset collection state
  reset() {
    this.collectedWords = [];
    this.collectedPhrases = [];
    this.cleanupRemainingSeeds();

    if (this.seedTimeout) {
      clearTimeout(this.seedTimeout);
      this.seedTimeout = null;
    }
  }
}

class SeedAnimation {
  constructor(element, position, velocity) {
    this.element = element;
    this.x = position.x;
    this.y = position.y;
    this.vx = velocity.vx;
    this.vy = velocity.vy;
    this.isAnimating = false;
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
  }

  animate() {
    if (!this.isAnimating) return;

    this.updatePosition();
    this.handleBoundaryCollisions();
    this.applyPosition();

    requestAnimationFrame(() => this.animate());
  }

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;
  }

  handleBoundaryCollisions() {
    // Horizontal boundaries
    if (this.x <= 0 || this.x >= window.innerWidth - this.element.offsetWidth) {
      this.vx = -this.vx;
      this.element.dataset.vx = this.vx;
    }

    // Vertical boundaries
    if (
      this.y <= 0 ||
      this.y >= window.innerHeight - this.element.offsetHeight
    ) {
      this.vy = -this.vy;
      this.element.dataset.vy = this.vy;
    }
  }

  applyPosition() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }
}
