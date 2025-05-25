export class QRScanner {
  constructor(game) {
    this.scannerOn = false;
    this.reader = null;
    this.placeBtn = document.getElementById("placeBtn");
    this.cameraContainer = document.getElementById("camera-container");
    this.mapContainer = document.getElementById("map-container");
    this.game = game;

    // Bind methods to preserve 'this' context
    this.onQRCodeDetected = this.onQRCodeDetected.bind(this);
    this.onScanError = this.onScanError.bind(this);
  }

  toggleScanner() {
    this.scannerOn = !this.scannerOn;

    if (this.scannerOn) {
      this.showCameraView();
      this.initializeReader();
      this.startScanner();
    } else {
      this.showMapView();
      this.stopScanner();
    }
  }

  showCameraView() {
    this.placeBtn.innerText = "CANCEL SCAN";
    this.cameraContainer.style.display = "block";
    this.mapContainer.style.display = "none";
  }

  showMapView() {
    this.placeBtn.innerText = "SCAN QR CODE";
    this.cameraContainer.style.display = "none";
    this.mapContainer.style.display = "block";
  }

  initializeReader() {
    if (!this.reader) {
      this.reader = new Html5Qrcode("camera");
    }
  }

  startScanner() {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    this.reader
      .start(
        { facingMode: "environment" },
        config,
        this.onQRCodeDetected,
        this.onScanError
      )
      .catch((err) => {
        console.error("Error starting scanner:", err);
        alert("Camera error: " + err.message);
      });
  }

  onQRCodeDetected(decodedText) {
    console.log("QR Code detected, data:", decodedText);

    const placeNumber = parseInt(decodedText);
    if (!isNaN(placeNumber) && places[placeNumber]) {
      console.log("Valid place found:", places[placeNumber]);
      this.game.showMarkerAt(places[placeNumber]);
      this.toggleScanner(); // stops the scanner
    } else {
      console.error("Invalid QR code or place not found:", decodedText);
      alert("Invalid QR code: Location not found");
    }
  }

  onScanError(errorMessage) {
    console.warn("QR scan error:", errorMessage);
  }

  async stopScanner() {
    if (this.reader) {
      try {
        await this.reader.stop();
        console.log("Scanner stopped successfully");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  }

  // Clean up resources when scanner is no longer needed
  destroy() {
    if (this.reader) {
      this.stopScanner();
      this.reader = null;
    }
  }
}
