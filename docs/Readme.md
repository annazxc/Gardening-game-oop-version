# Hello and Welcome!   
Play the game directly by clicking [here](https://annazxc.github.io/Gardening-game.github.io/).    
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
    info:"lake",
    level:0

- 2: 
    info:"berry bush",
    level:0

- 3: 
    info:"patch of herbs",
    level:0

- 4: 
    info:"cherry blossom tree garden",
    level:0

- 5:
    entrance to the cave for reating at level 1
    info:"resting area",
    level:0

- 6: 
    info:"Cabin Entrance",
    level:1

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
It uses RAG (Retrieval-Augmented Generation)  to enhance **Precision and Relevance** of the reply.

# Poem Generator
After players gather words from selected phrases in the **Word Collection Game**, the collected words are passed to **Gemini 2.0 Flash** to generate original poems.
These poems are presented in a notebook format.

## I created the vector database of "Alice's Adventures in Wonderland" in the [Colab notebook](https://colab.research.google.com/drive/1UBXK-FOxOxoQEHSp8lImWvXJcO_5jvyP)

# Required dependencies:
pip install flask flask-cors langchain-community huggingface-hub

# Run the API server:
python vector_db_api.py

# Check available voices
```
treeVoice.getAvailableVoices().forEach((voice, index) => {
    console.log(`Voice ${index}: ${voice.name} (${voice.lang})`);
});
```