# Gardening Wonderland

### 用途 (Purpose)

An interactive web-based game.
It aims to provide an engaging and imaginative experience by combining elements of gardening, exploration, storytelling, poem.
Leverages AI LLMs and RAG (retrieval augmented generation).

### 使用者功能 (User Functions)

- **Interactive Map Exploration:** Users can explore through QR code scanning to unlock specific locations, discover new locations.And includes GPS-based location finding to explore nearby virtual places.
- **Gardening Simulation:** Users can collect seeds, grow plants (seeds, sprouts, trees)

- **Storytelling with Wit Tree:** Users can interact with an AI-powered "Wit Tree" that answers questions about "Alice's Adventures in Wonderland" using Retrieval-Augmented Generation (RAG).
- **Poem Generation:** Users can collect words and phrases throughout the game, which are then used by an AI (Gemini 2.0 Flash) to generate original poems.
- **Slot Machine Mini-Game:** A slot machine game allows users to win sprouts.
- **Notebook:** A digital notebook tracks collected words, phrases, and provides access to poem generation and planting.
- **Audio :** Background music and sound effects

### 系統架構 (System Architecture)

The system is a client-server web application.

- **Client-Side (Frontend):**

  - Built with HTML, CSS, and JavaScript.
  - Handles user interface, game logic, interactions (map, QR scanning, planting, slot machine, notebook), and communication with backend services.
  - Uses external libraries like `html5-qrcode.min.js` for QR scanning and Leaflet.js for interactive maps.
  - Manages game state and progress primarily through `localStorage`.
  - Interacts with AI services (Gemini, Groq) via JavaScript for poem generation and the Wit Tree.
  - Key JavaScript files are organized into `docs/js` (main logic, page-specific scripts, utilities, data) and `docs/classes` (OOP components for game features).
  - Main HTML entry points: `index.html`, `QR.html`, `planting.html`, `location.html`.

- **Server-Side (Backend):**

  - A Python Flask API (`docs/api/vector_db_api.py`) serves a FAISS vector database.
  - This vector database contains the text of "Alice's Adventures in Wonderland" and is used by the Wit Tree (Storyteller) feature for RAG.
  - The API uses HuggingFace embeddings (`intfloat/multilingual-e5-small`) and Langchain.
  - The API runs on `localhost:8000`.

- **External AI Services:**
  - **Gemini API:** Used for poem generation (Gemini 2.0 Flash) and as a fallback for the Wit Tree.
  - **Groq API:** Used for the Wit Tree's primary LLM (Llama3-70b-8192).

### Interaction Flow:

1. User starts the game via `index.html`.
2. Navigates to `QR.html` to scan QR codes or explore the map.
3. Player movement and interaction with locations trigger events like seed collection.
4. Collected items are stored in `localStorage` and viewable in the Notebook.
5. The Wit Tree (`Storyteller` class) queries the Python Flask backend (`vector_db_api.py`) which uses a local vector store (`wonderland_db`). The `StorytellerAPI` class then queries the Groq API (or Gemini as fallback) with the retrieved context.
6. Poem generation (`PoemGenerator` class) uses collected words/phrases and calls the Gemini API directly from the client-side.
7. Planting and slot machine games are handled client-side.

## Development Platform

### 開發工具 (Development Tools)

- **Languages:** JavaScript (frontend), Python (backend API).
- **IDEs:** VS Code
- **Frameworks/Libraries (Frontend):**
  - without frameworks
  - Leaflet.js (interactive maps)
  - html5-qrcode (QR code scanning)
- **Frameworks/Libraries (Backend):**
  - Flask (Python web framework)
  - Langchain (Python library for LLM applications)
  - FAISS (vector store)
  - HuggingFace Transformers (embeddings)

### 開發環境 (Development Environment)

- **Operating System:** macOS
- **Hardware:** Macbook air M1
- **Cloud Platform:** vector database created in the [Colab notebook](https://colab.research.google.com/drive/1UBXK-FOxOxoQEHSp8lImWvXJcO_5jvyP)

### 伺服器平台資訊 (Server Platform Information)

- Developing phase: using vs code live server
- The frontend (HTML, CSS, JS) is hosted on GitHub Pages(only for static webpage).
- The backend Python Flask API (for the vector database) run locally on `localhost:8000`.

`RAG will not be used on GitHub Pages, as GitHub Pages only hosts static files. The backend currently runs locally. While it can be deployed separately (e.g., on Render using a Python backend), this option is not currently utilized.`

### 執行環境 (Runtime Environment)

- **Client:** Modern web browser with JavaScript enabled/ Live server for demo.
- **Backend API Server:** A Python environment with Flask and other dependencies installed, running locally.

  `pip install flask flask-cors langchain-community huggingface-hub faiss-cpu`

### 包括哪些檔案、程式功能 (Files and Program Functions)

**Root Directory:**

- `Readme.md`: Project overview, setup instructions, links, and credits.
- `specification.md`: This document.
- `.gitignore`:files that Git ignore. (API keys)
- `docs/`: Contains the main web application files.
- `extra/`: Contains supplementary files `wonderland.txt` and `QR.png`
  (alice in wonderland book and QR code contains places data)

**`docs/` Directory:**

- `index.html`: Main landing page.
- `QR.html`: Page for QR code scanning and map interaction.
- `planting.html`: Page for the planting game and slot machine.
- `location.html`: Page for interactive location exploration using GPS and Leaflet.
- `css/`: Contains CSS files for styling (`main.css`, `qr.css`, `seed.css`, `notebook.css`, `slot.css`, `planting.css`, `location.css`, `poem.css`, `storyteller.css`).
- `js/`: Contains core JavaScript logic.
  - `index.js`: Initializes `AudioController` (common across pages).
  - `qr.js`: Handles QR scanning logic, initializes `Game` and `QRScanner`.
  - `planting.js`: Handles logic for `planting.html`, initializes `PlantingManager` and `SlotMachine`.
  - `location.js`: Initializes `App` (from `locationMap.js`) for `location.html`.
  - `data.js`: Contains static game data (places, phrases).
  - `utils.js`: Utility functions (DOM manipulation, image preloading, etc.).
- `classes/`: Contains JavaScript classes for game components.
  - `audioControl.js`: `AudioController` class for managing background music and sound effects.
  - `buttons.js`: `Buttons` class for handling button event listeners and UI updates.
  - `controls.js`: `Controls` class for player movement and location checking.
  - `game.js`: `Game` class, central game logic, manages other components, player state, and UI.
  - `locationMap.js`: Defines `LocationMap`, `LocationService`, `PlacesService`, `MapService`, `UIService`, and `App` classes for geolocation, map display (Leaflet), and place information.
  - `notebook.js`: `NotebookManager` class for the in-game notebook (collected items, poem generation access).
  - `poem.js`: `PoemGenerator` class for generating poems using Gemini API.
  - `plantingManager.js`: `PlantingManager` class for managing sprouts and game ending.
  - `scanner.js`: `QRScanner` class for QR code scanning functionality.
  - `seed.js`: `SeedCollection` class for managing seed (word) collection, bouncing word animation, and phrase completion. Also defines `SeedAnimation`.
  - `slotMachine.js`: `SlotMachine` class for the slot machine mini-game.
  - `storyteller.js`: `Storyteller` class for the "Wit Tree" UI, interaction, and text-to-speech.
  - `storyteller_api.js`: `StorytellerAPI` class for interacting with the backend vector DB API, Groq API, and Gemini API for the Wit Tree.
- `api/`: Contains backend API and related files.
  - `keys.js`: Contains hardcoded API keys for various services.
  - `vector_db_api.py`: Python Flask API server for the FAISS vector database (uses Langchain, HuggingFace).
  - `wonderland_db/`: Directory intended to hold the FAISS vector database files.
- `assets/`: Contains static assets like images (`favicon.ico`, `bg1.png`, `level_0.png`, etc.), audio files.

**`extra/` Directory:**

- `wonderland.txt`: Text of "Alice's Adventures in Wonderland",used to build the vector database.
- `QR.png`: A QR code image for use in the game.
