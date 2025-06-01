import { places } from "../js/data.js";
import { showMessage, calculateDistance } from "../js/utils.js";

export class Controls {
  constructor(game) {
    this.game = game;
    this.markerPosition = {
      top: 0.5, //50% of parent container to the top margin
      left: 0.5,
      level: 0,
    };
    this.moveSpeed = 0.02; // 2% of parent container
    this.marker = null;
    this.mapContainer = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    // In JavaScript, `this` is dynamic, it’s determined by how a function is called, not where it's defined.
    // When passing a class method like `this.handleKeyDown` to addEventListener,
    // the browser calls it without a context, so `this` will be undefined in strict mode.
    // To ensure `this` refers to the class instance, bind it manually.
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
    }
  }

  // Move marker with bounds checking
  moveMarker(deltaX, deltaY) {
    if (!this.marker) return;

    this.markerPosition.left += deltaX;
    this.markerPosition.top += deltaY;

    // Keep marker within bounds
    //Clamp value between 0 to 1 --> 0% to 100%
    this.markerPosition.left = Math.max(
      0,
      Math.min(1, this.markerPosition.left)
    );
    this.markerPosition.top = Math.max(0, Math.min(1, this.markerPosition.top));

    // Update visual position
    this.updateMarkerPosition();

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

  handleExploring() {
    const { nearestPlace, minDistance } = this.checkLocation();

    if (nearestPlace) {
      this.game.handleLocationExploration(nearestPlace, minDistance);
    } else {
      showMessage(`
        No nearby locations.
        Please continue exploring
        to find interesting places.
      `);
    }
  }

  // Check for nearby locations
  checkLocation() {
    const threshold = 0.4;
    //40% distance of parent container,
    // cause marker position is defined by %
    let nearestPlace = null;
    let minDistance = Infinity;

    if (typeof places === "undefined") {
      console.warn("Places data not available");
      return { nearestPlace, minDistance };
    }

    // Find nearest place on current level
    // in data.js there are level_0,1,2 with different images respectively
    for (const id in places) {
      const place = places[id];

      if (place.level === this.markerPosition.level) {
        const distance = calculateDistance(place, this.markerPosition);

        if (distance < threshold && distance < minDistance) {
          nearestPlace = place;
          minDistance = distance;
        }
      }
    }
    return { nearestPlace, minDistance };
  }
}
