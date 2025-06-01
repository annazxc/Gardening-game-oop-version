import { StorytellerAPI } from "./storyteller_api.js";
import { loadCssFile } from "../js/utils.js";
import { createElement } from "../js/utils.js";
export class Storyteller {
  constructor() {
    this.storytellerAPI = new StorytellerAPI();
  }
  async init() {
    await this.initStorytellerSystem();
    console.log("Storyteller system fully initialized!");
  }
  createWitTree() {
    let existingTree = document.getElementById("wit-tree");
    if (existingTree) {
      return existingTree;
    }
    const witTree = createElement("div", {
      className: "wit-tree",
      id: "wit-tree",
      onclick: () => this.showStorytellerDialog(),
    });

    const mapContainer = document.getElementById("map-container");
    mapContainer.appendChild(witTree);

    return witTree;
  }

  showStorytellerDialog() {
    const dialog = createElement("div", {
      id: "storyteller-dialog",
      className: "storyteller-dialog",
    });
    const dialogContent = createElement("div", {
      className: "storyteller-content",
    });
    const title = createElement(
      "h2",
      { className: "storyteller-title" },
      "The Wit Tree"
    );
    dialogContent.appendChild(title);

    const intro = createElement(
      "p",
      { className: "storyteller-intro" },
      `Hello, curious wanderer! 
        I am the Wit Tree, keeper of stories from Wonderland. 
        What would you like to know about Alice's adventures?`
    );
    dialogContent.appendChild(intro);

    const chatHistory = createElement("div", {
      className: "storyteller-history",
      id: "storyteller-history",
    });
    dialogContent.appendChild(chatHistory);

    const inputContainer = createElement("div", {
      className: "storyteller-input-container",
    });

    const input = createElement("input", {
      type: "text",
      className: "storyteller-input",
      placeholder: "Anything curious about Alice in Wonderland ? ლ(╹◡╹ლ) :",
    });

    inputContainer.appendChild(input);
    const askButton = createElement(
      "button",
      {
        className: "storyteller-ask-btn",
        onclick: () => {
          this.askStorytellerQuestion(input.value);
          input.value = "";
        },
      },
      "Ask"
    );
    inputContainer.appendChild(askButton);

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.askStorytellerQuestion(input.value);
        input.value = "";
      }
    });
    dialogContent.appendChild(inputContainer);

    const closeButton = createElement(
      "button",
      {
        className: "storyteller-close-btn",
        onclick: () => {
          // Stop any ongoing speech when dialog closes
          const tree = this.initializeWitTree("wit-tree");
          if (tree) {
            tree.voice.cancel();
            tree.animator.stopSpeakingAnimation();
          }

          dialog.classList.remove("open");
          setTimeout(() => {
            dialog.style.display = "none";
          }, 500);
        },
      },
      "X"
    );

    dialogContent.appendChild(closeButton);

    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);

    setTimeout(() => {
      dialog.classList.add("open");
    }, 10);

    // Add focus to the input
    setTimeout(() => {
      input.focus();
    }, 500);
  }

  async askStorytellerQuestion(question) {
    if (!question.trim()) return;
    const chatHistory = document.getElementById("storyteller-history");

    // Add user question
    const userQ = createElement(
      "div",
      { className: "storyteller-user-message" },
      question
    );

    chatHistory.appendChild(userQ);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Add loading indicator
    const loading = createElement("div", {
      className: "storyteller-loading",
      innerHTML: '<div class="dot-typing"></div>',
    });

    chatHistory.appendChild(loading);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const treeController = this.initializeWitTree("wit-tree");

    let answer;
    answer = await this.storytellerAPI.queryAliceStorybase(question);

    // Remove loading indicator
    loading.remove();

    // Display the answer with typing animation
    const responseEl = document.createElement("div");
    responseEl.className = "storyteller-tree-message";
    chatHistory.appendChild(responseEl);

    treeController.animator.startSpeakingAnimation();
    treeController.voice.speak(answer);

    // Animate the text appearing
    this.typeWriterEffect(responseEl, answer, 0, 30);
    // Scroll to show the new message
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Create a typewriter effect for the tree's responses
  typeWriterEffect(element, text, i, speed) {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(() => this.typeWriterEffect(element, text, i, speed), speed);
    }
    // Scroll as the text appears
    const chatHistory = document.getElementById("storyteller-history");
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async initStorytellerSystem() {
    loadCssFile("css/storyteller.css");

    this.createWitTree();
    this.initializeWitTree("wit-tree");
  }

  initializeWitTree(treeId) {
    const treeElement = document.getElementById(treeId);
    if (!treeElement) {
      console.error(`Tree element with id ${treeId} not found`);
      return null;
    }

    return {
      animator: {
        startSpeakingAnimation: () => {
          treeElement.style.animation =
            "treeSpeak 0.5s ease-in-out infinite alternate";
        },
        stopSpeakingAnimation: () => {
          treeElement.style.animation = "none";
        },
      },
      voice: {
        speak: (text) => {
          if ("speechSynthesis" in window) {
            const speakWithVoice = () => {
              const utterance = new SpeechSynthesisUtterance(text);

              // Get available voices
              const voices = speechSynthesis.getVoices();
              console.log("Available voices:", voices.length);

              const ukMaleVoice =
                voices.find(
                  (voice) =>
                    voice.lang.includes("en-GB") &&
                    (voice.name.toLowerCase().includes("daniel") ||
                      voice.name.toLowerCase().includes("arthur") ||
                      voice.name.toLowerCase().includes("oliver") ||
                      voice.name.toLowerCase().includes("male"))
                ) ||
                voices.find((voice) => voice.lang.includes("en-GB")) ||
                voices.find(
                  (voice) =>
                    voice.name.toLowerCase().includes("daniel") ||
                    voice.name.toLowerCase().includes("arthur")
                );

              console.log(
                "Selected voice:",
                ukMaleVoice ? ukMaleVoice.name : "none found"
              );

              // Set the voice if found
              if (ukMaleVoice) {
                utterance.voice = ukMaleVoice;
              }

              utterance.rate = 1.2;
              utterance.pitch = 1.1;
              speechSynthesis.speak(utterance);

              utterance.onend = () => {
                const controller = this.initializeWitTree("wit-tree");
                if (controller) {
                  controller.animator.stopSpeakingAnimation();
                }
              };
            };

            // Check if voices are loaded
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              speakWithVoice();
            } else {
              // Wait for voices to load
              speechSynthesis.addEventListener(
                "voiceschanged",
                speakWithVoice,
                { once: true }
              );
            }
          }
        },
        cancel: () => {
          if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
          }
        },
      },
    };
  }
}
