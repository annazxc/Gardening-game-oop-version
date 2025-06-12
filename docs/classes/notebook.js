import { PoemGenerator } from "./poem.js";
import { createElement } from "../js/utils.js";
export class NotebookManager {
  constructor() {
    this.config = {
      overlayId: "notebook-overlay",
      overlayClass: "notebook-overlay",
      contentClass: "notebook-content",
      animationDelay: 10,
      closeDelay: 500,
    };

    this.elements = new Map();
    this.poem = new PoemGenerator();
  }

  showCollectionNotebook() {
    try {
      this.cleanup();
      const overlay = this.buildNotebookUI();
      this.renderNotebook(overlay);
      this.animateOpen(overlay);
    } catch (error) {
      console.error("Error showing collection notebook:", error);
      alert("Failed to open notebook. Please try again.");
    }
  }

  // Internal methods
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
    const overlay = createElement("div", {
      id: this.config.overlayId,
      className: this.config.overlayClass,
    });

    const content = createElement("div", {
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

  createTitleSection() {
    return createElement("h2", {}, `Your Collected Words & Phrases`);
  }
  createWordsSection() {
    const section = createElement("div", {
      className: "notebook-section",
    });

    const title = createElement("h3", {}, "Words Collected:");

    const words = JSON.parse(localStorage.getItem("words"));

    // Create container for words
    const wordsContainer = createElement("div", {
      className: "words-display",
    });

    // Group words into chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);

      // Create a line element for each group of 10 words
      const line = createElement(
        "div",
        {
          className: "words-line",
        },
        chunk.join(" ")
      );

      wordsContainer.appendChild(line);
    }

    const seedsCount = createElement(
      "p",
      {
        className: "seeds-count",
      },
      `Total Seeds: ${words.length}`
    );

    [title, wordsContainer, seedsCount].forEach((el) =>
      section.appendChild(el)
    );
    return section;
  }

  createPhrasesSection() {
    const section = createElement("div", {
      className: "notebook-section",
    });
    const title = createElement("h3", {}, "Completed Phrases:");

    section.appendChild(title);

    const phrases = JSON.parse(localStorage.getItem("phrases") || "[]");

    if (phrases.length > 0) {
      phrases.forEach((phrase) => {
        const phraseElement = createElement(
          "p",
          {
            className: "completed-phrase",
          },
          phrase
        );
        section.appendChild(phraseElement);
      });
    } else {
      const noPhrases = createElement(
        "p",
        {},
        "No complete phrases collected yet. Keep exploring!"
      );
      section.appendChild(noPhrases);
    }

    return section;
  }
  handleExchangeSeeds() {
    try {
      const words = JSON.parse(localStorage.getItem("words") || "[]");
      const phrases = JSON.parse(localStorage.getItem("phrases") || "[]");
      const seedCount = words.length;

      if (seedCount > 0) {
        // Store sprouts with timestamp for session tracking
        const sproutData = {
          count: seedCount,
          timestamp: Date.now(),
        };
        localStorage.setItem("sprouts", JSON.stringify(sproutData));

        if (phrases.length > 0) {
          if (typeof showSlotMachine !== "undefined") {
            showSlotMachine();
          }
        } else {
          alert(
            `You've exchanged ${seedCount} seeds for ${seedCount} sprouts!`
          );
        }
      } else {
        alert("You don't have any seeds to exchange yet!");
      }
    } catch (error) {
      console.error("Error exchanging seeds:", error);
      alert("Failed to exchange seeds. Please try again.");
    }
  }

  createButtonContainer() {
    const container = createElement("div", {
      className: "notebook-buttons",
    });

    const buttons = [
      this.createExchangeButton(),
      this.createPlantButton(),
      this.createContinueButton(),
      this.createPoemButton(),
    ];

    buttons.forEach((button) => container.appendChild(button));

    return container;
  }

  createExchangeButton() {
    return createElement(
      "button",
      {
        className: "btn btn-primary btn-success",
        onclick: () => this.handleExchangeSeeds(),
      },
      "Exchange Seeds for Sprouts"
    );
  }
  createPoemButton() {
    return createElement(
      "button",
      {
        className: "btn btn-primary",
        onclick: () => {
          this.poem.initPoemGenerator();
        },
      },
      "Generate Poem"
    );
  }

  createPlantButton() {
    return createElement(
      "button",
      {
        className: "btn btn-primary",
        onclick: () => this.handleStartPlanting(),
      },
      "Start Planting"
    );
  }

  createContinueButton() {
    return createElement(
      "button",
      {
        className: "btn btn-primary",
        onclick: () => this.handleContinue(),
      },
      "Keep going!"
    );
  }

  handleStartPlanting() {
    try {
      window.location.href = "planting.html";
    } catch (error) {
      console.error("Error navigating to planting page:", error);
      alert("Failed to navigate to planting page.");
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
}
