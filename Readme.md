# Hello and Welcome!

Play the game directly by clicking [here](https://annazxc.github.io/Gardening-game-oop-version/).

## Curious About Me?

Check out my [Personal Website](https://annazxc.github.io/) for more information!

## Music I Use:

- [Bensound.com - Royalty-Free Music](https://www.bensound.com/royalty-free-music)
- **dawnofchange**:
  - License Code: ZCJWO1SZ5FAUIR5K
- **slowlife**:
  - License Code: SVK4UOPBD8EQCGVQ
- **Suite from Alice's Adventures in Wonderland**

## Book:

- **Alice's Adventures in Wonderland** by Lewis Carroll
  - From: [Project Gutenberg](https://gutenberg.org/ebooks/11)

# QR code places

- 1:
  info: "Bamboo stem",
  top: 0.28,
  left: 0.82,
  level: 0,

- origin at the top left corner
  and top:0.28 means the distance is 28% of the parent container to the top margin

- 2:
  info: "Exotic Flowers",
  top: 0.75,
  left: 0.89,
  level: 2,

- 3:
  info: "Patch of Grass",
  top: 0.84,
  left: 0.23,
  level: 0,

- 4:
  info: "Bamboo Garden",
  top: 0.7,
  left: 0.43,
  level: 0,

- 5:
  info: "Pavilion",
  top: 0.74,
  left: 0.46,
  level: 2,

- 6:
  info: "Cabin Entrance",
  top: 0.78,
  left: 0.5,
  level: 1,

# Phrases in Alice's adventure in Wonderland used

## Phrases

- "We're all mad."
- "Curiouser still!"
- "No use going back; I'm different now."
- "Off with their heads!"
- "I've believed six impossible things before breakfast."
- "Who am I? That's the puzzle."
- "Start at the beginning, stop at the end."
- "I'm not crazy; my reality is different."
- "Every journey begins with a step."
- "Imagination wins against reality."
- "If all minded their business, the world would turn faster."
- "She gave great advice but rarely followed it."

## Explanation

- "Everyone has their own kind of madness; it's normal."
- "Amazement grows the more we explore the unknown."
- "We change constantly, so there's no point in looking back."
- "A harsh demand for punishment or justice."
- "Believing the impossible can open new possibilities."
- "Self-identity is one of life's biggest mysteries."
- "Follow a process step by step until completion."
- "Perspective defines reality, not madness."
- "Every adventure starts with a single decision."
- "Creativity is the strongest tool against a dull world."
- "Focusing on your own matters makes life smoother."
- "People often know what's best but don't act on it."

# The applications use **Gemini API** and **Groq API** to call LLMs.

# The Wit Tree: Storyteller

The **Wit Tree** is an interactive tree that uses Groq : llama3-70b-8192 to let user to ask about the storyline in alice's adventure in wonderland.
It uses RAG (Retrieval-Augmented Generation) to enhance **Precision and Relevance** of the reply.

# Poem Generator

After players gather words from selected phrases in the **Word Collection Game**, the collected words are passed to **Gemini 2.0 Flash** to generate original poems.

## I created the vector database of "Alice's Adventures in Wonderland" in the [Colab notebook](https://colab.research.google.com/drive/1e1Wq-6Y06wbs4NPsYJtpkybm40aXjVRw)

# Required dependencies:

pip install flask flask-cors langchain-community huggingface-hub faiss-cpu

# Run the API server:

firstly change directory to folder api
in terminal: cd/docs/api
python vector_db_api.py

# Used library

- QR code:
  html5-qrcode@2.3.8/html5-qrcode library

- [leaflet map](https://leafletjs.com/index.html)
- [leaflet plugin: routing machine](https://app.unpkg.com/leaflet-routing-machine@3.2.12/files/dist)

# Check available wit-tree voices

```
treeVoice.getAvailableVoices().forEach((voice, index) => {
    console.log(`Voice ${index}: ${voice.name} (${voice.lang})`);
});
```
