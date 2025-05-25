export class Controls {
  constructor(game) {
    this.game = game;
    this.markerPosition = {
      top: 0.5,
      left: 0.5,
      level: 0,
    };
    this.moveSpeed = 0.02;
    this.marker = null;
    this.mapContainer = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  setupControls() {
    this.marker = document.getElementById("marker");
    this.mapContainer = document.getElementById("map-container");

    document.addEventListener("keydown", this.handleKeyDown);
    this.mapContainer.addEventListener("keydown", this.handleKeyDown);
    console.log("Controls setup complete");
    return true;
  }

  handleKeyDown(e) {
    console.log("Key pressed:", e.key);

    switch (e.key) {
      case "ArrowUp":
        console.log("Moving up");
        this.moveMarker(0, -this.moveSpeed);
        e.preventDefault();
        break;
      case "ArrowDown":
        console.log("Moving down");
        this.moveMarker(0, this.moveSpeed);
        e.preventDefault();
        break;
      case "ArrowLeft":
        console.log("Moving left");
        this.moveMarker(-this.moveSpeed, 0);
        e.preventDefault();
        break;
      case "ArrowRight":
        console.log("Moving right");
        this.moveMarker(this.moveSpeed, 0);
        e.preventDefault();
        break;
      case "Enter":
      case " ": // Spacebar
        this.handleExploring();
        e.preventDefault();
        break;
    }
  }

  // Move marker with bounds checking
  moveMarker(deltaX, deltaY) {
    if (!this.marker) return;

    this.markerPosition.left += deltaX;
    this.markerPosition.top += deltaY;

    // Keep marker within bounds
    this.markerPosition.left = Math.max(
      0,
      Math.min(1, this.markerPosition.left)
    );
    this.markerPosition.top = Math.max(0, Math.min(1, this.markerPosition.top));

    // Update visual position
    this.updateMarkerPosition();

    // Notify game of position change for any game-specific logic
    if (this.game && this.game.onMarkerMove) {
      this.game.onMarkerMove(this.markerPosition);
    }
  }

  updateMarkerPosition() {
    if (this.marker) {
      this.marker.style.left = `${this.markerPosition.left * 100}%`;
      this.marker.style.top = `${this.markerPosition.top * 100}%`;
    }
  }
  //spread operator
  setMarkerPosition(position) {
    this.markerPosition = { ...this.markerPosition, ...position };
    this.updateMarkerPosition();
  }

  // Handle exploration at current location
  handleExploring() {
    const { nearestPlace, minDistance } = this.checkLocation();

    if (nearestPlace) {
      this.game.handleLocationExploration(nearestPlace, minDistance);
    } else {
      this.game?.showMessage(`
        No nearby locations.
        Please continue exploring
        to find interesting places.
      `);
    }
  }

  // Check for nearby locations
  checkLocation() {
    const threshold = 0.4;
    let nearestPlace = null;
    let minDistance = Infinity;

    // Check if places data is available
    if (typeof places === "undefined") {
      console.warn("Places data not available");
      return { nearestPlace, minDistance };
    }

    // Find nearest place on current level
    for (const id in places) {
      const place = places[id];

      if (place.level === this.markerPosition.level) {
        const dx = Math.abs(place.left - this.markerPosition.left);
        const dy = Math.abs(place.top - this.markerPosition.top);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < threshold && distance < minDistance) {
          nearestPlace = place;
          minDistance = distance;
        }
      }
    }

    return { nearestPlace, minDistance };
  }
}
