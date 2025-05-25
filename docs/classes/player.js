export class Player {
  constructor(name) {
    this.name = name;
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 50;
    this.maxStamina = 50;
    this.backpack = ["Seed", "Map", "Notebook"];
    this.discoveries = [];
    this.gameTime = 0;

    this.hudElement = null;
    this.backpackPanel = null;

    this.createHUD();
  }

  // Create the player HUD interface
  createHUD() {
    if (this.hudElement) {
      this.updateHUD();
      return;
    }

    this.hudElement = document.createElement("div");
    this.hudElement.id = "player-hud";
    this.hudElement.className = "player-hud";

    this.updateHUD();
    document.body.appendChild(this.hudElement);

    // Bind event listener with proper context
    const backpackButton = this.hudElement.querySelector("#toggle-backpack");
    backpackButton.addEventListener("click", () => this.toggleBackpack());
  }

  // Update HUD display with current stats
  updateHUD() {
    if (!this.hudElement) return;

    this.hudElement.innerHTML = `
      <div class="hud-name">${this.name}</div>
      <div class="hud-health">Health: ${this.health}/${this.maxHealth}</div>
      <div class="hud-stamina">Stamina: ${this.stamina}/${this.maxStamina}</div>
      <div class="hud-backpack">
        <button id="toggle-backpack">Backpack(${this.backpack.length})</button>
      </div>
    `;

    // Re-bind event listener after innerHTML update
    const backpackButton = this.hudElement.querySelector("#toggle-backpack");
    backpackButton.addEventListener("click", () => this.toggleBackpack());
  }

  // Toggle backpack panel visibility
  toggleBackpack() {
    if (this.backpackPanel) {
      const isVisible = this.backpackPanel.style.display !== "none";
      this.backpackPanel.style.display = isVisible ? "none" : "block";
    } else {
      this.createBackpackPanel();
    }
  }

  // Create the backpack interface panel
  createBackpackPanel() {
    this.backpackPanel = document.createElement("div");
    this.backpackPanel.id = "backpack-panel";
    this.backpackPanel.className = "backpack-panel";

    this.updateBackpackPanel();
    document.body.appendChild(this.backpackPanel);

    // Bind close button event
    const closeButton = this.backpackPanel.querySelector("#close-backpack");
    closeButton.addEventListener("click", () => {
      this.backpackPanel.style.display = "none";
    });
  }

  // Update backpack panel content
  updateBackpackPanel() {
    if (!this.backpackPanel) return;

    let backpackHTML = "<h3>Backpack</h3><ul>";
    this.backpack.forEach((item) => {
      backpackHTML += `<li>${item}</li>`;
    });
    backpackHTML += '</ul><button id="close-backpack">Close</button>';

    this.backpackPanel.innerHTML = backpackHTML;

    // Re-bind close button event after innerHTML update
    const closeButton = this.backpackPanel.querySelector("#close-backpack");
    closeButton.addEventListener("click", () => {
      this.backpackPanel.style.display = "none";
    });
  }

  // Reduce stamina when player moves
  updateStaminaOnMove(staminaCost = 5) {
    this.stamina = Math.max(0, this.stamina - staminaCost);
    this.updateHUD();

    if (this.stamina <= 10) {
      // Assuming Game is available globally
      if (typeof Game !== "undefined" && Game.showWarning) {
        Game.showWarning("Low stamina! Find a resting place soon.");
      }
    }
  }

  // Restore health and stamina to maximum
  rest() {
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;

    this.updateHUD();

    // Assuming Game is available globally
    if (typeof Game !== "undefined" && Game.showMessage) {
      Game.showMessage("You've rested and recovered your health and stamina!");
    }
  }

  // Add item to backpack
  addItem(item) {
    this.backpack.push(item);
    this.updateHUD();
    if (this.backpackPanel && this.backpackPanel.style.display !== "none") {
      this.updateBackpackPanel();
    }
  }

  // Remove item from backpack
  removeItem(item) {
    const index = this.backpack.indexOf(item);
    if (index > -1) {
      this.backpack.splice(index, 1);
      this.updateHUD();
      if (this.backpackPanel && this.backpackPanel.style.display !== "none") {
        this.updateBackpackPanel();
      }
      return true;
    }
    return false;
  }

  // Check if player has specific item
  hasItem(item) {
    return this.backpack.includes(item);
  }

  // Add discovery to player's record
  addDiscovery(discovery) {
    if (!this.discoveries.includes(discovery)) {
      this.discoveries.push(discovery);
    }
  }

  // Take damage
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.updateHUD();

    if (this.health <= 0) {
      // Handle player death
      if (typeof Game !== "undefined" && Game.showMessage) {
        Game.showMessage("You have died!");
      }
    }
  }

  // Heal player
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.updateHUD();
  }

  // Get current player state as object (for persistence)
  getState() {
    return {
      name: this.name,
      health: this.health,
      maxHealth: this.maxHealth,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      backpack: [...this.backpack],
      discoveries: [...this.discoveries],
      gameTime: this.gameTime,
    };
  }

  // Restore player state from object (for persistence)
  setState(state) {
    this.name = state.name;
    this.health = state.health;
    this.maxHealth = state.maxHealth;
    this.stamina = state.stamina;
    this.maxStamina = state.maxStamina;
    this.backpack = [...state.backpack];
    this.discoveries = [...state.discoveries];
    this.gameTime = state.gameTime;

    this.updateHUD();
    if (this.backpackPanel && this.backpackPanel.style.display !== "none") {
      this.updateBackpackPanel();
    }
  }

  // Clean up DOM elements when player is destroyed
  destroy() {
    if (this.hudElement) {
      this.hudElement.remove();
      this.hudElement = null;
    }
    if (this.backpackPanel) {
      this.backpackPanel.remove();
      this.backpackPanel = null;
    }
  }
}
