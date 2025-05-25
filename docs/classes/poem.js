import { getApiKey } from "../js/config.js";
export class PoemGenerator {
  constructor() {
    this.GEMINI_API_KEY = getApiKey("poem");
  }

  async generatePoemFromSeeds() {
    const API_URL =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

    const words = collectedWords.join(" ");
    const phrases = collectedPhrases.join(" ");

    let prompt = "Write a short, imaginative poem ";

    if (collectedPhrases.length > 0) {
      prompt += `inspired by these phrases: "${phrases}". `;
    }

    if (collectedWords.length > 0) {
      prompt += `Try to incorporate these words: ${words}. `;
    }

    prompt +=
      "The poem should have an Alice in Wonderland-like whimsical, magical quality. Make it 4-8 lines long.";

    try {
      const response = await fetch(`${API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const poem = data.candidates[0].content.parts[0].text;

      this.displayPoem(poem);

      return poem;
    } catch (error) {
      console.error("Error generating poem:", error);

      const fallbackPoem = this.generateFallbackPoem(words, phrases);
      this.displayPoem(fallbackPoem);

      return fallbackPoem;
    }
  }

  displayPoem(poem) {
    const poemModal = document.createElement("div");
    poemModal.className = "poem-modal";

    const poemContent = document.createElement("div");
    poemContent.className = "poem-content";

    const title = document.createElement("h2");
    title.textContent = "Your Garden Poem : ";
    poemContent.appendChild(title);

    const poemText = document.createElement("div");
    poemText.className = "poem-text";

    const formattedPoem = poem.split("\n").map((line) => {
      const lineElement = document.createElement("p");
      lineElement.textContent = line;
      return lineElement;
    });

    formattedPoem.forEach((line) => poemText.appendChild(line));
    poemContent.appendChild(poemText);

    const poemNote = document.createElement("p");
    poemNote.className = "poem-note";
    poemNote.textContent =
      "This poem was inspired by the words and phrases you collected on your journey.";
    poemContent.appendChild(poemNote);

    const closeButton = document.createElement("button");
    closeButton.className = "btn btn-primary";
    closeButton.textContent = "Save & Continue";
    closeButton.onclick = function () {
      if (poemModal.classList.contains("closing")) return;
      poemModal.classList.add("closing");

      setTimeout(() => {
        poemModal.remove();
      }, 500);
    };
    poemContent.appendChild(closeButton);

    poemModal.appendChild(poemContent);
    document.body.appendChild(poemModal);

    setTimeout(() => {
      poemModal.classList.add("open");
    }, 10);
  }

  generateFallbackPoem(words, phrases) {
    const usableWords = collectedWords.slice(
      0,
      Math.min(5, collectedWords.length)
    );

    let poem = "Down the rabbit hole of words,\n";
    poem += "Where " + usableWords.join(" and ") + " swirl,\n";

    if (collectedPhrases.length > 0) {
      poem += collectedPhrases[0] + "\n";
    }

    poem += "A garden of wonders unfurls.";

    return poem;
  }

  updateNotebookWithPoem() {
    const originalShowNotebook = window.showCollectionNotebook;
    let poemButtonAdded = false;

    window.showCollectionNotebook = () => {
      originalShowNotebook();
      if (!poemButtonAdded) {
        const notebookContent = document.querySelector(".notebook-content");
        if (notebookContent) {
          const poemButton = document.createElement("button");
          poemButton.className = "btn btn-primary";
          poemButton.textContent = "Your Garden Poem";
          poemButton.onclick = () => this.generatePoemFromSeeds();

          // Get the button container or create one
          let buttonContainer = document.querySelector(".notebook-buttons");
          buttonContainer.insertBefore(poemButton, buttonContainer.lastChild);
          poemButtonAdded = true;
        }
      }
    };
  }

  initPoemGenerator() {
    this.updateNotebookWithPoem();
    this.loadCssFile("css/poem.css");
  }

  loadCssFile(cssFilePath) {
    if (!document.querySelector(`link[href="${cssFilePath}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = cssFilePath;
      document.head.appendChild(link);
    }
  }
}
