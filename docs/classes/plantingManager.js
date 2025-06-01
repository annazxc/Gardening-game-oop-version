//for seeds to sprout management

export class PlantingManager {
  constructor() {
    this.sproutsKey = "sprouts";
  }

  initialize() {
    this.loadSproutsCount();
    this.createEndGameButton();
  }
  loadSproutsCount() {
    try {
      const sproutsData = localStorage.getItem(this.sproutsKey);
      const count = sproutsData ? JSON.parse(sproutsData).count : 0;
      document.getElementById("sprouts-count").textContent = count;
      return count;
    } catch (error) {
      console.error("Error loading sprouts:", error);
      document.getElementById("sprouts-count").textContent = "0";
      return 0;
    }
  }

  // New method to safely get current sprouts count
  getSproutsCount() {
    try {
      const sproutsData = localStorage.getItem(this.sproutsKey);
      return sproutsData ? JSON.parse(sproutsData).count : 0;
    } catch (error) {
      console.error("Error getting sprouts count:", error);
      return 0;
    }
  }

  // New method to safely set sprouts count
  setSproutsCount(count) {
    try {
      localStorage.setItem(this.sproutsKey, JSON.stringify({ count: count }));
      const sproutsCountElement = document.getElementById("sprouts-count");
      if (sproutsCountElement) {
        sproutsCountElement.textContent = count;
      }
    } catch (error) {
      console.error("Error setting sprouts count:", error);
    }
  }

  // New method to add to sprouts count
  addSprouts(bonus) {
    const currentCount = this.getSproutsCount();
    const newCount = currentCount + bonus;
    this.setSproutsCount(newCount);
    return newCount;
  }

  createEndGameButton() {
    const endButton = document.createElement("button");
    endButton.textContent = "End Game & Return";
    endButton.className = "btn btn-primary end-game-btn";
    endButton.onclick = () => this.endGame();
    document.body.appendChild(endButton);
  }

  endGame() {
    this.clearGameData();
    alert("Thanks for playing! ");

    window.location.href = "index.html"; //restart
  }

  clearGameData() {
    localStorage.removeItem("sprouts");
    localStorage.removeItem("words");
  }
}
