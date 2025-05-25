export class Storyteller {
  constructor() {
    this.witTreeController = null;
    this.responseCache = new Map();
  }

  createWitTree(x, y) {
    let existingTree = document.getElementById("wit-tree");
    if (existingTree) {
      return existingTree;
    }

    const witTree = document.createElement("div");
    witTree.id = "wit-tree";
    witTree.className = "wit-tree";
    witTree.style.position = "absolute";
    witTree.style.left = `${x}px`;
    witTree.style.top = `${y}px`;
    witTree.style.width = "300px";
    witTree.style.height = "150px";
    witTree.style.backgroundImage = "url('assets/images/wit-tree.png')";
    witTree.style.backgroundSize = "contain";
    witTree.style.backgroundRepeat = "no-repeat";
    witTree.style.cursor = "pointer";
    witTree.style.zIndex = "50";

    witTree.addEventListener("click", () => {
      this.showStorytellerDialog();
    });

    const treeController = this.initializeWitTree("wit-tree");

    const mapContainer =
      document.getElementById("map-container") || document.body;
    mapContainer.appendChild(witTree);

    setInterval(() => {
      if (Math.random() > 0.7) {
        this.createFallingLeaf(witTree);
      }
    }, 3000);

    return witTree;
  }

  createFallingLeaf(treeElement) {
    const leaf = document.createElement("div");
    leaf.className = "falling-leaf";

    const treeRect = treeElement.getBoundingClientRect();
    const startX = Math.random() * 80 + 20;

    leaf.style.position = "absolute";
    leaf.style.left = `${startX}px`;
    leaf.style.top = "50px";
    leaf.style.width = "10px";
    leaf.style.height = "10px";
    leaf.style.backgroundColor = Math.random() > 0.5 ? "#8BC34A" : "#CDDC39";
    leaf.style.borderRadius = "50% 0 50% 50%";
    leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
    leaf.style.opacity = "0.8";
    leaf.style.zIndex = "49";

    treeElement.appendChild(leaf);

    let posY = 50;
    let posX = startX;
    let rotation = Math.random() * 360;
    let opacity = 0.8;

    const fall = () => {
      posY += 1;
      posX += Math.sin(posY / 10) * 0.5;
      rotation += 2;
      opacity -= 0.005;

      leaf.style.top = `${posY}px`;
      leaf.style.left = `${posX}px`;
      leaf.style.transform = `rotate(${rotation}deg)`;
      leaf.style.opacity = opacity;

      if (posY < 200 && opacity > 0) {
        requestAnimationFrame(fall);
      } else {
        leaf.remove();
      }
    };

    requestAnimationFrame(fall);
  }

  showStorytellerDialog() {
    let existingDialog = document.getElementById("storyteller-dialog");
    if (existingDialog) {
      existingDialog.classList.add("open");
      return;
    }

    const dialog = document.createElement("div");
    dialog.id = "storyteller-dialog";
    dialog.className = "storyteller-dialog";

    const dialogContent = document.createElement("div");
    dialogContent.className = "storyteller-content";

    const title = document.createElement("h2");
    title.textContent = "The Wit Tree";
    title.className = "storyteller-title";
    dialogContent.appendChild(title);

    const intro = document.createElement("p");
    intro.textContent = `Hello, curious wanderer! 
        I am the Wit Tree, keeper of stories from Wonderland. 
        What would you like to know about Alice's adventures?`;
    intro.className = "storyteller-intro";
    dialogContent.appendChild(intro);

    const chatHistory = document.createElement("div");
    chatHistory.className = "storyteller-history";
    chatHistory.id = "storyteller-history";
    dialogContent.appendChild(chatHistory);

    const inputContainer = document.createElement("div");
    inputContainer.className = "storyteller-input-container";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "storyteller-input";
    input.placeholder =
      "Anything curious about Alice in Wonderland ? ლ(╹◡╹ლ) :";
    inputContainer.appendChild(input);

    const askButton = document.createElement("button");
    askButton.className = "storyteller-ask-btn";
    askButton.textContent = "Ask";
    askButton.onclick = () => {
      this.askStorytellerQuestion(input.value);
      input.value = "";
    };
    inputContainer.appendChild(askButton);

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.askStorytellerQuestion(input.value);
        input.value = "";
      }
    });

    dialogContent.appendChild(inputContainer);

    const closeButton = document.createElement("button");
    closeButton.className = "storyteller-close-btn";
    closeButton.textContent = "X";
    closeButton.onclick = () => {
      // Stop any ongoing speech when dialog closes
      const treeController = this.getWitTreeController();
      if (treeController) {
        treeController.voice.cancel();
        treeController.animator.stopSpeakingAnimation();
      }

      dialog.classList.remove("open");
      setTimeout(() => {
        dialog.style.display = "none";
      }, 500);
    };
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
    const userQ = document.createElement("div");
    userQ.className = "storyteller-user-message";
    userQ.textContent = question;
    chatHistory.appendChild(userQ);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Add loading indicator
    const loading = document.createElement("div");
    loading.className = "storyteller-loading";
    loading.innerHTML = '<div class="dot-typing"></div>';
    chatHistory.appendChild(loading);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const treeController = this.getWitTreeController();

    // Trigger animations and get cached or fresh answer
    treeController.animator.activateGlowEffect();
    let answer;

    // Check cache first
    const cachedResponse = this.getCachedResponse(question);
    if (cachedResponse) {
      answer = cachedResponse;
    } else {
      // If not in cache, fetch from API
      answer = await queryAliceStorybase(question);
      // Cache the new response
      this.cacheResponse(question, answer);
    }

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

  getWitTreeController() {
    // Check if controller already exists
    if (this.witTreeController) {
      return this.witTreeController;
    }

    // If not, create it
    const treeElement = document.getElementById("wit-tree");
    if (!treeElement) {
      console.error("Tree element not found");
      return null;
    }

    // Initialize controller
    this.witTreeController = this.initializeWitTree("wit-tree");
    return this.witTreeController;
  }

  // Response caching methods
  getCachedResponse(question) {
    const simplifiedQuestion = this.simplifyForCache(question);
    return this.responseCache.get(simplifiedQuestion);
  }

  cacheResponse(question, answer) {
    const simplifiedQuestion = this.simplifyForCache(question);
    this.responseCache.set(simplifiedQuestion, answer);

    // Limit cache size to prevent memory issues
    if (this.responseCache.size > 20) {
      // Remove oldest entry
      const oldestKey = this.responseCache.keys().next().value;
      this.responseCache.delete(oldestKey);
    }
  }

  simplifyForCache(text) {
    // Simple normalization for better cache hits
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
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

  initStorytellerSystem() {
    this.loadCssFile("css/storyteller.css");

    const treeX = 500;
    const treeY = 300;
    this.createWitTree(treeX, treeY);

    // Initialize our enhanced features
    const treeController = this.getWitTreeController();

    // Add player proximity detection for the glow effect
    document.addEventListener("mousemove", (event) => {
      const treeElement = document.getElementById("wit-tree");
      if (!treeElement) return;

      const treeRect = treeElement.getBoundingClientRect();
      const treeCenterX = treeRect.left + treeRect.width / 2;
      const treeCenterY = treeRect.top + treeRect.height / 2;

      // Calculate distance from mouse to tree center
      const distance = Math.sqrt(
        Math.pow(event.clientX - treeCenterX, 2) +
          Math.pow(event.clientY - treeCenterY, 2)
      );

      // If mouse is close to tree, trigger the glow effect
      if (distance < 200) {
        treeController.animator.triggerReactionToPlayerApproach();
      }
    });

    console.log("Enhanced storyteller system initialized!");
  }

  // This is a stub method since we don't have the actual implementation
  initializeWitTree(treeId) {
    // In the original code, this function should be defined elsewhere
    // For now, we'll create a minimal object to prevent errors
    return {
      animator: {
        activateGlowEffect: () => console.log("Activating glow effect"),
        startSpeakingAnimation: () => console.log("Start speaking animation"),
        stopSpeakingAnimation: () => console.log("Stop speaking animation"),
        triggerReactionToPlayerApproach: () =>
          console.log("Tree reacts to player approach"),
      },
      voice: {
        speak: (text) => console.log(`Tree says: ${text}`),
        cancel: () => console.log("Speech canceled"),
      },
    };
  }
}

// Create singleton instance
const storytellerInstance = new Storyteller();

// Compatibility API functions
function createWitTree(x, y) {
  return storytellerInstance.createWitTree(x, y);
}

function createFallingLeaf(treeElement) {
  return storytellerInstance.createFallingLeaf(treeElement);
}

function showStorytellerDialog() {
  return storytellerInstance.showStorytellerDialog();
}

function askStorytellerQuestion(question) {
  return storytellerInstance.askStorytellerQuestion(question);
}

function typeWriterEffect(element, text, i, speed) {
  return storytellerInstance.typeWriterEffect(element, text, i, speed);
}

function getWitTreeController() {
  return storytellerInstance.getWitTreeController();
}

function initStorytellerSystem() {
  return storytellerInstance.initStorytellerSystem();
}
