import { getApiKey } from "../api/keys.js";
class LocationMap {
  constructor(config = {}) {
    this.config = {
      mapContainerId: "map",
      locationInfoId: "location-info",
      nearbyPlacesId: "nearby-places",
      loadingId: "loading",
      defaultZoom: 13,
      ...config,
    };

    this.map = null;
    this.locationData = null;
    this.allPlaces = [];
    // Initialize services
    this.locationService = new LocationService();
    this.placesService = new PlacesService();
    this.mapService = new MapService();
    this.uiService = new UIService();
  }

  async init() {
    try {
      this.locationData = await this.locationService.getPreciseLocation();
      this.uiService.displayLocationInfo(this.locationData);

      const isDaytime = this.locationService.checkIfDaytime(
        this.locationData.timezone
      );
      const timeOfDay = isDaytime ? "day" : "night";

      this.map = await this.mapService.createInteractiveMap(
        this.locationData.latitude,
        this.locationData.longitude,
        timeOfDay,
        this.config.mapContainerId,
        this.config.defaultZoom
      );

      this.allPlaces = this.placesService.getNearbyPlaces();
      this.uiService.displayNearbyPlaces(this.locationData, this.allPlaces);

      this.mapService.addRoutePlanning(
        this.map,
        this.locationData.latitude,
        this.locationData.longitude
      );

      this.uiService.addCategoryFilters(
        this.locationData,
        this.allPlaces,
        this.handleCategoryFilter.bind(this)
      );

      this.hideLoading();
    } catch (error) {
      this.handleError(error);
    }
  }

  handleCategoryFilter(category) {
    const filteredPlaces =
      category === "all"
        ? this.allPlaces
        : this.allPlaces.filter((place) => place.category === category);

    this.uiService.displayNearbyPlaces(this.locationData, filteredPlaces);
  }

  hideLoading() {
    const loadingElement = document.getElementById(this.config.loadingId);
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  handleError(error) {
    console.error("LocationMap Error:", error);
    const locationInfo = document.getElementById(this.config.locationInfoId);
    if (locationInfo) {
      locationInfo.textContent = "Error detecting location. Please try again.";
    }
    this.hideLoading();
  }
}

//handling geolocation and location data
class LocationService {
  constructor() {
    this.fallbackAPI = "https://ipapi.co/json/";
    this.geocodeAPI =
      "https://api.bigdatacloud.net/data/reverse-geocode-client";
  }

  //Get precise location using device GPS or IP fallback
  getPreciseLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.getIPLocation().then(resolve).catch(reject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = await this.enhanceLocationData(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(locationData);
          } catch (error) {
            resolve(
              this.createBasicLocationData(
                position.coords.latitude,
                position.coords.longitude
              )
            );
          }
        },
        (error) => {
          console.warn(
            "Geolocation permission denied, falling back to IP",
            error
          );
          this.getIPLocation().then(resolve).catch(reject);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  //fallback : Get location data from IP address
  async getIPLocation() {
    const response = await fetch(this.fallbackAPI);
    if (!response.ok) {
      throw new Error("Failed to fetch IP location data");
    }
    return await response.json();
  }

  //reverse geocoding(add district/country name)
  //timezone for day/night
  async enhanceLocationData(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.geocodeAPI}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();

      return {
        latitude,
        longitude,
        city: data.locality || data.city,
        region: data.principalSubdivision,
        country_name: this.normalizeCountryName(data.countryName),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ip: "Using device location",
      };
    } catch (error) {
      return this.createBasicLocationData(latitude, longitude);
    }
  }

  //when geocoding fails
  createBasicLocationData(latitude, longitude) {
    return {
      latitude,
      longitude,
      city: "Unknown location",
      region: "",
      country_name: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ip: "Using device location",
    };
  }

  normalizeCountryName(countryName) {
    if (countryName === "Taiwan (Province of China)") {
      return "Taiwan";
    }
    return countryName;
  }

  checkIfDaytime(timezone) {
    const now = new Date();
    const localTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const hours = localTime.getHours();
    return hours >= 6 && hours < 18;
  }
}

class PlacesService {
  constructor() {
    this.places = this.initPlacesData();
  }

  getNearbyPlaces() {
    return this.places;
  }

  initPlacesData() {
    return [
      {
        name: "Bamboo stem",
        category: "garden",
        address: "Wonderland road 23",
        rating: 4.8,
        latitude: 25.079841939680758,
        longitude: 121.52485088681586,
      },
      {
        name: "Exotic Flowers",
        category: "garden",
        address: "Magical street 12",
        rating: 4.6,
        latitude: 25.069643238548274,
        longitude: 121.52892654695127,
      },
      {
        name: "Cabin Entrance",
        category: "cabin",
        address: "Happy Dream road 34",
        rating: 4.5,
        latitude: 25.09170693312087,
        longitude: 121.57094395910302,
      },
      {
        name: "Pavilion",
        category: "attraction",
        address: "Mushroom View 22",
        rating: 4.7,
        latitude: 25.09213421399661,
        longitude: 121.57647043602816,
      },
      {
        name: "Wonder Library",
        category: "attraction",
        address: "Book Avenue 45",
        rating: 4.9,
        latitude: 25.13652709294163,
        longitude: 121.50687025323924,
      },
      {
        name: "Coffee House",
        category: "attraction",
        address: "Bean Street 12",
        rating: 4.5,
        latitude: 25.0509237031393,
        longitude: 121.58392918663694,
      },
    ];
  }
}

//Leaflet map operations
class MapService {
  constructor() {}

  async createInteractiveMap(
    latitude,
    longitude,
    timeOfDay,
    containerId,
    zoom = 13
  ) {
    const map = L.map(containerId).setView([latitude, longitude], zoom);
    //getApiKey in config.js
    const apiKey = getApiKey("location");
    //maptiler api and if day/night time different style
    const style = timeOfDay === "day" ? "streets" : "satellite";
    const end = timeOfDay === "day" ? "png" : "jpg";

    L.tileLayer(
      `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.${end}?key=${apiKey}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }
    ).addTo(map);

    this.addUserMarker(map, latitude, longitude);
    console.log(
      "Tile URL:",
      `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${apiKey}`
    );
    console.log("Style:", style);
    console.log("API Key:", apiKey);

    return map;
  }

  addUserMarker(map, latitude, longitude) {
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("<strong>You are here!</strong>")
      .openPopup();
  }

  addRoutePlanning(map, userLat, userLng) {
    if (typeof L.Routing === "undefined") {
      console.warn("Leaflet Routing plugin not available");
      return;
    }

    const routeControl = L.Routing.control({
      waypoints: [L.latLng(userLat, userLng)],
      routeWhileDragging: true,
      geocoder: L.Control.Geocoder.nominatim(),
    }).addTo(map);

    this.addRoutingInstructions();
    this.setupMapClickRouting(map, routeControl);
  }

  addRoutingInstructions() {
    const instructionDiv = document.createElement("div");
    instructionDiv.style.textAlign = "center";
    instructionDiv.style.margin = "10px 0";
    instructionDiv.innerHTML =
      "<p>Click anywhere on the map to get directions from your location!</p>";

    const container = document.querySelector(".container");
    const nearbyPlaces = document.getElementById("nearby-places");
    if (container && nearbyPlaces) {
      container.insertBefore(instructionDiv, nearbyPlaces);
    }
  }

  setupMapClickRouting(map, routeControl) {
    map.on("click", function (e) {
      routeControl.spliceWaypoints(1, 1, e.latlng);
    });
  }
}

class UIService {
  displayLocationInfo(data) {
    const locationInfo = document.getElementById("location-info");
    if (!locationInfo) return;

    const now = new Date();
    const localTime = new Date(
      now.toLocaleString("en-US", { timeZone: data.timezone })
    );
    const timeString = localTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isDaytime = this.checkIfDaytime(data.timezone);
    const timeOfDayText = isDaytime ? "Daytime" : "Nighttime";

    locationInfo.innerHTML = `
            <h2>You are in ${data.city}, ${data.country_name}</h2>
            <p><strong>Coordinates:</strong> ${data.latitude.toFixed(
              4
            )}, ${data.longitude.toFixed(4)}</p>
            <p><strong>Local time:</strong> ${timeString} (${timeOfDayText})</p>
        `;

    this.showWelcomeAlert(data);
  }

  showWelcomeAlert(data) {
    alert(`Welcome! 
            You are in ${data.city}, ${data.country_name}! 
            Discover interesting places in wonderland nearby!`);
  }

  displayNearbyPlaces(origin, places) {
    const placesContainer = document.getElementById("nearby-places");
    if (!placesContainer) return;

    placesContainer.innerHTML = "";

    places.forEach((place) => {
      const placeCard = this.createPlaceCard(place, origin);
      placesContainer.appendChild(placeCard);
    });
  }

  createPlaceCard(place, origin) {
    const placeCard = document.createElement("div");
    placeCard.className = `place-card ${place.category}`;
    placeCard.innerHTML = `
            <h3>${place.name}</h3>
            <p>${place.address}</p>
            <p>Rating: ${place.rating} ⭐</p>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${place.latitude},${place.longitude}" target="_blank">Directions</a>
        `;
    return placeCard;
  }

  addCategoryFilters(origin, places, onFilterChange) {
    const filterContainer = this.createFilterContainer();
    this.insertFilterContainer(filterContainer);
    this.setupFilterEventListeners(filterContainer, onFilterChange);
  }

  createFilterContainer() {
    const filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";
    filterContainer.innerHTML = `
            <button data-category="all" class="active">All Places</button>
            <button data-category="garden">Garden</button>
            <button data-category="attraction">Attraction</button>
            <button data-category="cabin">Cabin</button>
        `;
    return filterContainer;
  }

  insertFilterContainer(filterContainer) {
    const container = document.querySelector(".container");
    const nearbyPlaces = document.getElementById("nearby-places");
    if (container && nearbyPlaces) {
      container.insertBefore(filterContainer, nearbyPlaces);
    }
  }

  setupFilterEventListeners(filterContainer, onFilterChange) {
    filterContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        this.updateActiveFilter(e.target);
        const category = e.target.dataset.category;
        onFilterChange(category);
      }
    });
  }

  updateActiveFilter(activeButton) {
    document.querySelectorAll(".filter-container button").forEach((btn) => {
      btn.classList.remove("active");
    });
    activeButton.classList.add("active");
  }

  checkIfDaytime(timezone) {
    const now = new Date();
    const localTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const hours = localTime.getHours();
    return hours >= 6 && hours < 18;
  }
}

//entry point
export class App {
  constructor() {
    this.locationMap = new LocationMap();
  }

  init() {
    this.locationMap.init();
  }
}
