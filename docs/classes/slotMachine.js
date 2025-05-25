export class SlotMachine {
  constructor() {
    this.items = ["🌱", "🌿", "🌳", "🌸", "🍎", "💎"];
    this.overlay = null;
    this.reels = [];
    this.resultDisplay = null;
    this.spinButton = null;
  }

  show() {
    this.overlay = document.createElement("div");
    this.overlay.id = "slot-machine-overlay";
    this.overlay.className = "slot-machine-overlay";

    const slotMachineContent = document.createElement("div");
    slotMachineContent.className = "slot-machine-content";

    const title = document.createElement("h2");
    title.textContent = "Slot Machine!";
    slotMachineContent.appendChild(title);

    const slotDisplay = document.createElement("div");
    slotDisplay.className = "slot-display";

    for (let i = 0; i < 3; i++) {
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      reel.id = `reel-${i}`;
      reel.innerHTML = "?";
      slotDisplay.appendChild(reel);
      this.reels.push(reel);
    }

    slotMachineContent.appendChild(slotDisplay);

    this.spinButton = document.createElement("button");
    this.spinButton.className = "btn btn-warning spin-button";
    this.spinButton.textContent = "SPIN!";
    this.spinButton.onclick = () => {
      this.spin();
      this.spinButton.disabled = true;

      setTimeout(() => {
        this.spinButton.disabled = false;
      }, 3000);
    };

    slotMachineContent.appendChild(this.spinButton);

    this.resultDisplay = document.createElement("div");
    this.resultDisplay.className = "result-display";
    this.resultDisplay.id = "result-display";
    this.resultDisplay.textContent = "Spin to win prizes!";
    slotMachineContent.appendChild(this.resultDisplay);

    const closeButton = document.createElement("button");
    closeButton.className = "btn btn-secondary";
    closeButton.textContent = "Close";
    closeButton.onclick = () => this.close();

    slotMachineContent.appendChild(closeButton);
    this.overlay.appendChild(slotMachineContent);
    document.body.appendChild(this.overlay);

    setTimeout(() => {
      this.overlay.classList.add("open");
    }, 10);
  }

  close() {
    this.overlay.classList.add("closing");
    setTimeout(() => {
      this.overlay.remove();
    }, 500);
  }

  spin() {
    this.reels.forEach((reel, index) => {
      const duration = 2000 + Math.random() * 1000;
      let spins = 0;
      const spinInterval = setInterval(() => {
        const randomItem =
          this.items[Math.floor(Math.random() * this.items.length)];
        reel.textContent = randomItem;
        spins++;

        // End spinning
        if (spins > duration / 100) {
          clearInterval(spinInterval);
        }
      }, 100);
    });

    // After all reels stop, check for win
    setTimeout(() => {
      this.checkWin();
    }, 3000);
  }

  checkWin() {
    const results = this.reels.map((reel) => reel.textContent);

    let bonus = 0;
    let reward = "";
    if (results[0] === results[1] && results[1] === results[2]) {
      // All three match - jackpot!
      bonus = 50;
      reward = `JACKPOT! All three match! You won ${bonus} bonus sprouts!`;
    } else if (
      results[0] === results[1] ||
      results[1] === results[2] ||
      results[0] === results[2]
    ) {
      // Two match
      bonus = 20;
      reward = `You got a pair! You won ${bonus} bonus sprouts!`;
    } else {
      // No match
      bonus = 5;
      reward = `No matches, but you still win ${bonus} bonus sprouts!`;
    }

    // Add bonus to sprouts count
    const sprouts = parseInt(localStorage.getItem("sprouts") || 0);
    localStorage.setItem("sprouts", sprouts + bonus);

    // Update sprouts display if it exists
    const sproutsCountElement = document.getElementById("sprouts-count");
    if (sproutsCountElement) {
      sproutsCountElement.textContent = sprouts + bonus;
    }

    this.resultDisplay.textContent = reward;
  }
}
