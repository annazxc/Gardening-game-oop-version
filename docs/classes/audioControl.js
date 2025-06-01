import { createElement } from "../js/utils.js";

export class AudioController {
  constructor() {
    this.audioElement = null;
    this.playButton = null;
    this.musicSelector = null;
    this.audioControlContainer = null;
    //key-value pair
    this.pageMusic = {
      "index.html": "assets/audio/intro.mp3",
      "planting.html": "assets/audio/seeding.mp3",
      "QR.html": "assets/audio/jazz.mp3",
      "location.html": "assets/audio/slowlife.mp3",
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
    this.assembleElements();
    this.setInitialAudioSource();
    this.setupEventListeners();
    this.updateButtonText();
  }
  createControlContainer() {
    this.audioControlContainer = createElement("div", {
      className: "audio-control-container",
    });
  }

  createPlayButton() {
    this.playButton = createElement(
      "button",
      {
        id: "playAudioButton",
        className: "btn btn-primary audio-btn",
      },
      "Play Music"
    );
  }

  createMusicSelector() {
    this.musicSelector = createElement("select", {
      id: "musicSelector",
      className: "audio-selector",
    });

    const defaultOption = createElement(
      "option",
      { value: "" },
      "-- Select a Song --"
    );

    this.musicSelector.appendChild(defaultOption);

    this.playlist.forEach((song) => {
      const option = createElement(
        "option",
        { value: song },
        this.songNames[song] || song.split("/").pop().replace(".mp3", "")
      );
      this.musicSelector.appendChild(option);
    });
  }

  createAudioElement() {
    this.audioElement = document.getElementById("backgroundAudio");
    if (!this.audioElement) {
      this.audioElement = createElement("audio", { id: "backgroundAudio" });
      document.body.appendChild(this.audioElement);
    }
  }

  assembleElements() {
    this.audioControlContainer.appendChild(this.playButton);
    this.audioControlContainer.appendChild(this.musicSelector);
    document.body.appendChild(this.audioControlContainer);
  }

  setInitialAudioSource() {
    //split the url into an array using /,e.g./docs/QR.html =>["", "docs", "QR.html"]
    //.pop => pop the last item
    const currentPage = window.location.pathname.split("/").pop();
    if (this.pageMusic[currentPage]) {
      this.audioElement.src = this.pageMusic[currentPage];
      const pageTrackIndex = this.playlist.indexOf(this.pageMusic[currentPage]);
      if (pageTrackIndex !== -1) {
        //indexOf: Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
        this.currentTrack = pageTrackIndex;
        this.musicSelector.value = this.playlist[this.currentTrack];
      }
    } else {
      this.audioElement.src = this.playlist[0]; //defaults to the first track in the playlist
    }
  }

  updateButtonText() {
    this.playButton.textContent = this.audioElement.paused
      ? "Play Music"
      : "Pause Music";
  }

  playNextTrack() {
    //this.playlist.length=7,if currentTrack=0,then next track is 1 and % make sure it loop automatically
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
