export class NotebookManager {
  static _instance = null;

  constructor(dependencies = {}) {
    // Enforce singleton pattern
    if (NotebookManager._instance) {
      return NotebookManager._instance;
    }

    // Configuration
    this.config = {
      overlayId: "notebook-overlay",
      overlayClass: "notebook-overlay",
      contentClass: "notebook-content",
      animationDelay: 10,
      closeDelay: 500,
    };

    // Dependency injection for better testability
    this.dependencies = {
      collectedWords:
        dependencies.collectedWords ||
        (typeof collectedWords !== "undefined" ? collectedWords : []),
      collectedPhrases:
        dependencies.collectedPhrases ||
        (typeof collectedPhrases !== "undefined" ? collectedPhrases : []),
      poemGenerator:
        dependencies.poemGenerator ||
        (typeof poemGeneratorInstance !== "undefined"
          ? poemGeneratorInstance
          : null),
      storage: dependencies.storage || localStorage,
      navigator: dependencies.navigator || window.location,
      showSlotMachine:
        dependencies.showSlotMachine ||
        (typeof showSlotMachine !== "undefined" ? showSlotMachine : () => {}),
      alert: dependencies.alert || window.alert,
    };

    this.elements = new Map();
    NotebookManager._instance = this;
  }

  static getInstance(dependencies = {}) {
    if (!NotebookManager._instance) {
      NotebookManager._instance = new NotebookManager(dependencies);
    }
    return NotebookManager._instance;
  }

  // Main public method to show the notebook
  showCollectionNotebook() {
    try {
      this.cleanup();
      const overlay = this.buildNotebookUI();
      this.renderNotebook(overlay);
      this.animateOpen(overlay);
    } catch (error) {
      console.error("Error showing collection notebook:", error);
      this.dependencies.alert("Failed to open notebook. Please try again.");
    }
  }

  // Internal methods (conceptually private, but public for simplicity)
  cleanup() {
    const existingOverlay = document.querySelector(
      `.${this.config.overlayClass}`
    );
    if (existingOverlay) {
      existingOverlay.remove();
    }
    this.elements.clear();
  }

  buildNotebookUI() {
    const overlay = this.createElement("div", {
      id: this.config.overlayId,
      className: this.config.overlayClass,
    });

    const content = this.createElement("div", {
      className: this.config.contentClass,
    });

    // Build UI sections
    const sections = [
      this.createTitleSection(),
      this.createWordsSection(),
      this.createPhrasesSection(),
      this.createButtonContainer(),
    ];

    sections.forEach((section) => content.appendChild(section));
    overlay.appendChild(content);

    return overlay;
  }

  renderNotebook(overlay) {
    document.body.appendChild(overlay);
    this.elements.set("overlay", overlay);
  }

  animateOpen(overlay) {
    setTimeout(() => {
      overlay.classList.add("open");
    }, this.config.animationDelay);
  }

  createElement(tag, attributes = {}, textContent = "") {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "onclick") {
        element.onclick = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  createTitleSection() {
    return this.createElement("h2", {}, `Your Collected Words & Phrases`);
  }

  createWordsSection() {
    const section = this.createElement("div", {
      className: "notebook-section",
    });

    const title = this.createElement("h3", {}, "Words Collected:");
    const wordsList = this.createElement(
      "p",
      {},
      this.dependencies.collectedWords.join(" ")
    );
    const seedsCount = this.createElement(
      "p",
      {
        className: "seeds-count",
      },
      `Total Seeds: ${this.dependencies.collectedWords.length}`
    );

    [title, wordsList, seedsCount].forEach((el) => section.appendChild(el));

    return section;
  }

  createPhrasesSection() {
    const section = this.createElement("div", {
      className: "notebook-section",
    });
    const title = this.createElement("h3", {}, "Completed Phrases:");

    section.appendChild(title);

    // Initialize poem generator if available
    if (
      this.dependencies.poemGenerator &&
      this.dependencies.poemGenerator.initPoemGenerator
    ) {
      this.dependencies.poemGenerator.initPoemGenerator();
    }

    if (this.dependencies.collectedPhrases.length > 0) {
      this.dependencies.collectedPhrases.forEach((phrase) => {
        const phraseElement = this.createElement(
          "p",
          {
            className: "completed-phrase",
          },
          phrase
        );
        section.appendChild(phraseElement);
      });
    } else {
      const noPhrases = this.createElement(
        "p",
        {},
        "No complete phrases collected yet. Keep exploring!"
      );
      section.appendChild(noPhrases);
    }

    return section;
  }

  createButtonContainer() {
    const container = this.createElement("div", {
      className: "notebook-buttons",
    });

    const buttons = [
      this.createExchangeButton(),
      this.createPlantButton(),
      this.createContinueButton(),
    ];

    buttons.forEach((button) => container.appendChild(button));

    return container;
  }

  createExchangeButton() {
    return this.createElement(
      "button",
      {
        className: "btn btn-primary btn-success",
        onclick: () => this.handleExchangeSeeds(),
      },
      "Exchange Seeds for Sprouts"
    );
  }

  createPlantButton() {
    return this.createElement(
      "button",
      {
        className: "btn btn-primary",
        onclick: () => this.handleStartPlanting(),
      },
      "Start Planting"
    );
  }

  createContinueButton() {
    return this.createElement(
      "button",
      {
        className: "btn btn-primary",
        onclick: () => this.handleContinue(),
      },
      "Keep going!"
    );
  }

  handleExchangeSeeds() {
    try {
      const seedCount = this.dependencies.collectedWords.length;

      if (seedCount > 0) {
        this.dependencies.storage.setItem("sprouts", seedCount.toString());

        if (this.dependencies.collectedPhrases.length > 0) {
          this.dependencies.showSlotMachine();
        } else {
          this.dependencies.alert(
            `You've exchanged ${seedCount} seeds for ${seedCount} sprouts!`
          );
        }
      } else {
        this.dependencies.alert("You don't have any seeds to exchange yet!");
      }
    } catch (error) {
      console.error("Error exchanging seeds:", error);
      this.dependencies.alert("Failed to exchange seeds. Please try again.");
    }
  }

  handleStartPlanting() {
    try {
      this.dependencies.navigator.href = "planting.html";
    } catch (error) {
      console.error("Error navigating to planting page:", error);
      this.dependencies.alert("Failed to navigate to planting page.");
    }
  }

  handleContinue() {
    try {
      const overlay =
        this.elements.get("overlay") ||
        document.getElementById(this.config.overlayId);

      if (!overlay || overlay.classList.contains("closing")) {
        return;
      }

      overlay.classList.add("closing");

      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
        this.elements.delete("overlay");
      }, this.config.closeDelay);
    } catch (error) {
      console.error("Error closing notebook:", error);
    }
  }

  // Public utility methods
  updateDependencies(newDependencies) {
    this.dependencies = { ...this.dependencies, ...newDependencies };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    this.cleanup();
    NotebookManager._instance = null;
  }
}
