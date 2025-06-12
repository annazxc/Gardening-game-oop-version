import { loadCssFile, createElement } from "../js/utils.js";
import { getApiKey } from "../api/keys.js";
export class PoemGenerator {
  constructor() {
    this.GEMINI_API_KEY = getApiKey("gemini");
    this.words = JSON.parse(localStorage.getItem("words"));
    this.phrases = JSON.parse(localStorage.getItem("phrases"));
    this.isPoemGenerated = false;
    this.poemButtonAdded = false;
  }

  async generatePoemFromSeeds() {
    const API_URL =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

    const words = this.words;
    const phrases = this.phrases;

    let prompt = "Write a short, imaginative poem ";

    if (phrases.length > 0) {
      prompt += `inspired by these phrases: "${phrases}". `;
    }

    if (words.length > 0) {
      prompt += `Try to incorporate these words: ${words}. `;
    }

    prompt += `The poem should have an Alice in Wonderland-like whimsical, magical quality. 
      Make it 4-8 lines long.
      Don't add symbols like *`;

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
      return "Error generating poem";
    }
  }

  displayPoem(poem) {
    if (!this.isPoemGenerated) {
      const poemModal = createElement("div", { className: "poem-modal" });
      const poemContent = createElement("div", { classname: "poem-content" });
      const title = createElement("h2", {}, "Your Garden Poem : ");
      poemContent.appendChild(title);
      const poemText = createElement("div", { className: "poem-text" });
      const formattedPoem = poem.split("\n").map((line) => {
        const lineElement = createElement("p", {}, line);
        return lineElement;
      });

      formattedPoem.forEach((line) => poemText.appendChild(line));
      poemContent.appendChild(poemText);
      const poemNote = createElement(
        "p",
        { className: "poem-note" },
        "This poem was inspired by the words and phrases you collected on your journey."
      );
      poemContent.appendChild(poemNote);
      const closeButton = createElement(
        "button",
        {
          className: "btn btn-primary",
          onclick: () => {
            if (poemModal.classList.contains("closing")) return;
            poemModal.classList.add("closing");
            this.reset();

            setTimeout(() => {
              poemModal.remove();
            }, 500);
          },
        },
        "Save & Continue"
      );
      poemContent.appendChild(closeButton);

      poemModal.appendChild(poemContent);
      document.body.appendChild(poemModal);
      this.isPoemGenerated = true;
      setTimeout(() => {
        poemModal.classList.add("open");
      }, 10);
    }
  }

  updateNotebookWithPoem() {
    if (!this.poemButtonAdded) {
      const notebookContent = document.querySelector(".notebook-content");
      if (notebookContent) {
        const poemButton = document.createElement("button");
        poemButton.className = "btn btn-primary";
        poemButton.textContent = "Your Garden Poem";
        poemButton.onclick = () => this.generatePoemFromSeeds();

        // Get the button container or create one
        let buttonContainer = document.querySelector(".notebook-buttons");
        buttonContainer.insertBefore(poemButton, buttonContainer.lastChild);
        this.poemButtonAdded = true;
      }
    }
  }
  reset() {
    this.isPoemGenerated = false;
  }

  initPoemGenerator() {
    this.updateNotebookWithPoem();
    loadCssFile("css/poem.css");
  }
}
