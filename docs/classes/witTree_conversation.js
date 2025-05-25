export class StorytellerDialog {
  constructor(options = {}) {
    this.config = {
      dialogId: "storyteller-dialog",
      historyId: "storyteller-history",
      title: "The Wit Tree",
      introText: `Hello, curious wanderer! 
    I am the Wit Tree, keeper of stories from Wonderland. 
    What would you like to know about Alice's adventures?`,
      placeholder: "Anything curious about Alice in Wonderland ? ლ(╹◡╹ლ) :",
      typewriterSpeed: 30,
      ...options,
    };

    this.elements = {
      dialog: null,
      content: null,
      history: null,
      input: null,
    };

    this.isInitialized = false;
    this.init();
  }

  init() {
    if (!this.isInitialized) {
      this.addStyles();
      this.isInitialized = true;
    }
  }

  //show dialog
  show() {
    let existingDialog = document.getElementById(this.config.dialogId);
    if (existingDialog) {
      existingDialog.classList.add("open");
      this.focusInput();
      return;
    }

    this.createDialog();
    this.attachEventListeners();

    setTimeout(() => {
      this.elements.dialog.classList.add("open");
    }, 10);

    setTimeout(() => {
      this.focusInput();
    }, 500);
  }

  //hide dialog
  hide() {
    if (this.elements.dialog) {
      this.elements.dialog.classList.remove("open");
      setTimeout(() => {
        this.elements.dialog.style.display = "none";
      }, 500);
    }
  }

  createDialog() {
    this.elements.dialog = this.createElement("div", {
      id: this.config.dialogId,
      className: "storyteller-dialog",
    });

    this.elements.content = this.createElement("div", {
      className: "storyteller-content",
    });

    this.createTitle();
    this.createIntro();
    this.createChatHistory();
    this.createInputContainer();
    this.createCloseButton();

    this.elements.dialog.appendChild(this.elements.content);
    document.body.appendChild(this.elements.dialog);
  }

  createTitle() {
    const title = this.createElement("h2", {
      className: "storyteller-title",
      textContent: this.config.title,
    });
    this.elements.content.appendChild(title);
  }

  createIntro() {
    const intro = this.createElement("p", {
      className: "storyteller-intro",
      textContent: this.config.introText,
    });
    this.elements.content.appendChild(intro);
  }

  createChatHistory() {
    this.elements.history = this.createElement("div", {
      className: "storyteller-history",
      id: this.config.historyId,
    });
    this.elements.content.appendChild(this.elements.history);
  }

  createInputContainer() {
    const inputContainer = this.createElement("div", {
      className: "storyteller-input-container",
    });

    this.elements.input = this.createElement("input", {
      type: "text",
      className: "storyteller-input",
      placeholder: this.config.placeholder,
    });

    const askButton = this.createElement("button", {
      className: "storyteller-ask-btn",
      textContent: "Ask",
    });

    inputContainer.appendChild(this.elements.input);
    inputContainer.appendChild(askButton);
    this.elements.content.appendChild(inputContainer);

    // Store reference to ask button for event listeners
    this.elements.askButton = askButton;
  }

  createCloseButton() {
    const closeButton = this.createElement("button", {
      className: "storyteller-close-btn",
      textContent: "X",
    });
    this.elements.content.appendChild(closeButton);
    this.elements.closeButton = closeButton;
  }

  /**
   * Attach event listeners to interactive elements
   */
  attachEventListeners() {
    // Ask button click
    this.elements.askButton.onclick = () => {
      this.askQuestion(this.elements.input.value);
      this.elements.input.value = "";
    };

    // Input field Enter key
    this.elements.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.askQuestion(this.elements.input.value);
        this.elements.input.value = "";
      }
    });

    // Close button click
    this.elements.closeButton.onclick = () => {
      this.hide();
    };
  }

  /**
   * Process and display a user question
   * @param {string} question - The user's question
   */
  async askQuestion(question) {
    if (!question.trim()) return;

    this.addUserMessage(question);
    this.showLoadingIndicator();

    try {
      const answer = await this.queryStorybase(question);
      this.hideLoadingIndicator();
      this.addTreeMessage(answer);
    } catch (error) {
      this.hideLoadingIndicator();
      this.addTreeMessage(
        "Sorry, I encountered an error while thinking about your question. Please try again."
      );
      console.error("Storyteller error:", error);
    }
  }

  /**
   * Add user message to chat history
   * @param {string} message - User message
   */
  addUserMessage(message) {
    const userMessage = this.createElement("div", {
      className: "storyteller-user-message",
      textContent: message,
    });
    this.elements.history.appendChild(userMessage);
    this.scrollToBottom();
  }

  /**
   * Add tree response message to chat history
   * @param {string} message - Tree response message
   */
  addTreeMessage(message) {
    const treeMessage = this.createElement("div", {
      className: "storyteller-tree-message",
    });
    this.elements.history.appendChild(treeMessage);
    this.typewriterEffect(treeMessage, message);
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator() {
    this.elements.loading = this.createElement("div", {
      className: "storyteller-loading",
      innerHTML: '<div class="dot-typing"></div>',
    });
    this.elements.history.appendChild(this.elements.loading);
    this.scrollToBottom();
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    if (this.elements.loading) {
      this.elements.loading.remove();
      this.elements.loading = null;
    }
  }

  /**
   * Typewriter effect for displaying text
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to display
   * @param {number} index - Current character index
   */
  typewriterEffect(element, text, index = 0) {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      setTimeout(() => {
        this.typewriterEffect(element, text, index + 1);
      }, this.config.typewriterSpeed);
    }
    this.scrollToBottom();
  }

  /**
   * Query the Alice storybase (wrapper for external function)
   * @param {string} question - The question to ask
   * @returns {Promise<string>} - The answer from the storybase
   */
  async queryStorybase(question) {
    // This maintains compatibility with the existing queryAliceStorybase function
    if (typeof queryAliceStorybase === "function") {
      return await queryAliceStorybase(question);
    } else {
      // Fallback response if the external function doesn't exist
      return "I'm sorry, but I can't access my story knowledge right now. Please make sure the story database is properly connected.";
    }
  }

  /**
   * Scroll chat history to bottom
   */
  scrollToBottom() {
    if (this.elements.history) {
      this.elements.history.scrollTop = this.elements.history.scrollHeight;
    }
  }

  /**
   * Focus the input field
   */
  focusInput() {
    if (this.elements.input) {
      this.elements.input.focus();
    }
  }

  /**
   * Helper method to create DOM elements with properties
   * @param {string} tag - HTML tag name
   * @param {Object} props - Element properties
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, props = {}) {
    const element = document.createElement(tag);
    Object.keys(props).forEach((key) => {
      if (key === "textContent" || key === "innerHTML") {
        element[key] = props[key];
      } else if (key === "className") {
        element.className = props[key];
      } else {
        element.setAttribute(key, props[key]);
      }
    });
    return element;
  }

  addStyles() {
    // Avoid adding styles multiple times
    if (document.getElementById("storyteller-styles")) {
      return;
    }

    const styleElement = this.createElement("style", {
      id: "storyteller-styles",
    });

    styleElement.textContent = `
            /* Wit Tree Styles */
            .wit-tree {
                transition: transform 0.5s ease;
            }
            
            /* Dialog Styles */
            .storyteller-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.5s ease;
                pointer-events: none;
            }
            
            .storyteller-dialog.open {
                opacity: 1;
                pointer-events: auto;
            }
            
            .storyteller-content {
                background-color: #f8f0e5;
                width: 80%;
                max-width: 600px;
                height: 70%;
                max-height: 600px;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                position: relative;
                display: flex;
                flex-direction: column;
                background-image: linear-gradient(to bottom, #f8f0e5, #e8d8c3);
                border: 8px solid #7e4c21;
            }
            
            .storyteller-title {
                color: #5d3a18;
                text-align: center;
                font-family: 'Georgia', serif;
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .storyteller-intro {
                color: #7e4c21;
                font-style: italic;
                text-align: center;
                margin-bottom: 20px;
            }
            
            .storyteller-history {
                flex: 1;
                overflow-y: auto;
                margin-bottom: 15px;
                padding: 10px;
                background-color: rgba(255, 255, 255, 0.6);
                border-radius: 10px;
            }
            
            .storyteller-user-message {
                background-color: #e1f5fe;
                border-radius: 15px 15px 3px 15px;
                padding: 10px 15px;
                margin: 5px 0 5px auto;
                max-width: 80%;
                color: #01579b;
                text-align: right;
            }
            
            .storyteller-tree-message {
                background-color: #e8f5e9;
                border-radius: 15px 15px 15px 3px;
                padding: 10px 15px;
                margin: 5px auto 5px 0;
                max-width: 80%;
                color: #1b5e20;
                position: relative;
            }
            
            .storyteller-tree-message:before {
                content: '';
                position: absolute;
                width: 30px;
                height: 30px;
                background-image: url('assets/images/leaf-icon.png');
                background-size: contain;
                background-repeat: no-repeat;
                left: -20px;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .storyteller-input-container {
                display: flex;
                margin-top: 10px;
            }
            
            .storyteller-input {
                flex: 1;
                padding: 10px 15px;
                border: 2px solid #7e4c21;
                border-radius: 20px;
                font-size: 16px;
                outline: none;
            }
            
            .storyteller-ask-btn {
                background-color: #7e4c21;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 10px 20px;
                margin-left: 10px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            
            .storyteller-ask-btn:hover {
                background-color: #5d3a18;
            }
            
            .storyteller-close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: #7e4c21;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                font-weight: bold;
            }
            
            /* Loading animation */
            .storyteller-loading {
                text-align: center;
                padding: 10px;
            }
            
            .dot-typing {
                position: relative;
                left: -9999px;
                width: 10px;
                height: 10px;
                border-radius: 5px;
                background-color: #7e4c21;
                color: #7e4c21;
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                animation: dot-typing 1.5s infinite linear;
            }
            
            @keyframes dot-typing {
                0% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
                16.667% {
                    box-shadow: 9984px -10px 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
                33.333% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
                50% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px -10px 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
                66.667% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
                83.333% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px -10px 0 0 #7e4c21;
                }
                100% {
                    box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
                }
            }
        `;

    document.head.appendChild(styleElement);
  }
  //Destroy the dialog and clean up resources

  destroy() {
    if (this.elements.dialog) {
      this.elements.dialog.remove();
    }

    const styles = document.getElementById("storyteller-styles");
    if (styles) {
      styles.remove();
    }

    this.elements = {};
    this.isInitialized = false;
  }
}

// Maintain backward compatibility with global functions
let globalStorytellerInstance = null;

/**
 * Global function to show storyteller dialog (maintains compatibility)
 */
function showStorytellerDialog() {
  if (!globalStorytellerInstance) {
    globalStorytellerInstance = new StorytellerDialog();
  }
  globalStorytellerInstance.show();
}

/**
 * Global function to ask storyteller question (maintains compatibility)
 * @param {string} question - The question to ask
 */
async function askStorytellerQuestion(question) {
  if (globalStorytellerInstance) {
    await globalStorytellerInstance.askQuestion(question);
  }
}

/**
 * Global function to add storyteller styles (maintains compatibility)
 */
function addStorytellerStyles() {
  if (!globalStorytellerInstance) {
    globalStorytellerInstance = new StorytellerDialog();
  }
}

/**
 * Global function for typewriter effect (maintains compatibility)
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to display
 * @param {number} i - Character index
 * @param {number} speed - Typing speed
 */
function typeWriterEffect(element, text, i, speed) {
  if (globalStorytellerInstance) {
    globalStorytellerInstance.typewriterEffect(element, text, i);
  }
}
