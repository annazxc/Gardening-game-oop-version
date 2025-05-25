export class AudioController {
  constructor() {
    this.audioElement = null;
    this.playButton = null;
    this.musicSelector = null;
    this.audioControlContainer = null;

    this.pageMusic = {
      "index.html": "assets/audio/intro.mp3",
      "planting.html": "assets/audio/seeding.mp3",
      "QR.html": "assets/audio/jazz.mp3",
      "home.html": "assets/audio/slowlife.mp3",
    };

    this.playlist = [
      "assets/audio/garden.mp3",
      "assets/audio/seeding.mp3",
      "assets/audio/jazz.mp3",
      "assets/audio/slowlife.mp3",
      "assets/audio/dawnofchange.mp3",
      "assets/audio/TeaParty.mp3",
      "assets/audio/FlowerGarden.mp3",
    ];

    this.songNames = {
      "assets/audio/garden.mp3": "Garden Melody",
      "assets/audio/seeding.mp3": "Seeding Time",
      "assets/audio/jazz.mp3": "Jazz Interlude",
      "assets/audio/slowlife.mp3": "Slow Life",
      "assets/audio/dawnofchange.mp3": "Dawn of Change",
      "assets/audio/intro.mp3": "Introduction",
    };

    this.currentTrack = 0;
    this.isPlaying = false;
    this.userSelectedTrack = false;
  }

  init() {
    this.createAudioElement();
    this.createControlContainer();
    this.createPlayButton();
    this.createMusicSelector();
    this.removeExistingElements();
    this.assembleElements();
    this.addStyling();
    this.setInitialAudioSource();
    this.setupEventListeners();
    this.updateButtonText();
  }

  createAudioElement() {
    this.audioElement = document.getElementById("backgroundAudio");
    if (!this.audioElement) {
      this.audioElement = document.createElement("audio");
      this.audioElement.id = "backgroundAudio";
      document.body.appendChild(this.audioElement);
    }
  }

  createControlContainer() {
    this.audioControlContainer = document.createElement("div");
    this.audioControlContainer.className = "audio-control-container";
    this.audioControlContainer.style.position = "absolute";
    this.audioControlContainer.style.top = "var(--space-sm)";
    this.audioControlContainer.style.right = "var(--space-sm)";
    this.audioControlContainer.style.zIndex = "var(--z-index-ui)";
    this.audioControlContainer.style.display = "flex";
    this.audioControlContainer.style.flexDirection = "column";
    this.audioControlContainer.style.alignItems = "flex-end";
    this.audioControlContainer.style.gap = "10px";
  }

  createPlayButton() {
    this.playButton = document.createElement("button");
    this.playButton.id = "playAudioButton";
    this.playButton.className = "btn btn-primary audio-btn";
    this.playButton.textContent = "Play Music";
    this.playButton.style.position = "relative";
    this.playButton.style.zIndex = "2";
  }

  createMusicSelector() {
    this.musicSelector = document.createElement("select");
    this.musicSelector.id = "musicSelector";
    this.musicSelector.className = "audio-selector";
    this.musicSelector.style.marginTop = "5px";
    this.musicSelector.style.padding = "5px";
    this.musicSelector.style.width = "200px";
    this.musicSelector.style.zIndex = "1";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select a Song --";
    this.musicSelector.appendChild(defaultOption);

    this.playlist.forEach((song) => {
      const option = document.createElement("option");
      option.value = song;
      option.textContent =
        this.songNames[song] || song.split("/").pop().replace(".mp3", "");
      this.musicSelector.appendChild(option);
    });
  }

  removeExistingElements() {
    const existingButton = document.getElementById("playAudioButton");
    if (existingButton) {
      existingButton.remove();
    }
    const existingSelector = document.getElementById("musicSelector");
    if (existingSelector) {
      existingSelector.remove();
    }
  }

  assembleElements() {
    this.audioControlContainer.appendChild(this.playButton);
    this.audioControlContainer.appendChild(this.musicSelector);
    document.body.appendChild(this.audioControlContainer);
  }

  addStyling() {
    const styleTag = document.createElement("style");
    styleTag.textContent = `
            .audio-control-container {
                transition: all 0.3s ease;
            }
            .audio-selector {
                background-color: var(--color-background);
                color: var(--color-text);
                border: 1px solid var(--color-border);
                border-radius: var(--border-radius-sm);
                transition: all 0.3s ease;
            }
            .audio-selector:hover {
                border-color: var(--color-accent);
            }
        `;
    document.head.appendChild(styleTag);
  }

  setInitialAudioSource() {
    const currentPage = window.location.pathname.split("/").pop();
    if (this.pageMusic[currentPage]) {
      this.audioElement.src = this.pageMusic[currentPage];
      const pageTrackIndex = this.playlist.indexOf(this.pageMusic[currentPage]);
      if (pageTrackIndex !== -1) {
        this.currentTrack = pageTrackIndex;
        this.musicSelector.value = this.playlist[this.currentTrack];
      }
    } else {
      this.audioElement.src = this.playlist[0];
    }
  }

  updateButtonText() {
    this.playButton.textContent = this.audioElement.paused
      ? "Play Music"
      : "Pause Music";
  }

  playNextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
    this.audioElement.src = this.playlist[this.currentTrack];
    this.audioElement.play();
    this.musicSelector.value = this.playlist[this.currentTrack];
  }

  togglePlayPause() {
    if (this.audioElement.paused) {
      this.audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      this.isPlaying = true;
    } else {
      this.audioElement.pause();
      this.isPlaying = false;
    }
    this.updateButtonText();
    console.log("togglePlayPause called");
    console.log("audioElement:", this.audioElement);
    console.log("audioElement.paused:", this.audioElement?.paused);
  }

  handleMusicSelection(value) {
    if (value) {
      this.audioElement.src = value;
      this.userSelectedTrack = true;

      const selectedIndex = this.playlist.indexOf(value);
      if (selectedIndex !== -1) {
        this.currentTrack = selectedIndex;
      }

      this.audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      this.isPlaying = true;
      this.updateButtonText();
    }
  }

  setupEventListeners() {
    this.audioElement.addEventListener("ended", () => {
      this.userSelectedTrack = false;
      this.playNextTrack();
    });

    this.playButton.addEventListener("click", () => {
      this.togglePlayPause();
    });

    this.musicSelector.addEventListener("change", (event) => {
      this.handleMusicSelection(event.target.value);
    });
  }
}
