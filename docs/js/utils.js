export function loadCssFile(cssFilePath) {
  if (!document.querySelector(`link[href="${cssFilePath}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = cssFilePath;
    document.head.appendChild(link);
  }
}
export function createElement(tag, attributes = {}, textContent = "") {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "onclick") {
      element.onclick = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}
export function displayTemporaryElement(element, duration) {
  setTimeout(() => {
    element.classList.add("fade-out"); //animation: fade-out 1s ease-in-out forwards
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 1000);
  }, duration);
}

export function showMessage(message, duration = 3000) {
  if (!message) return;

  const messageBox = createElement(
    "div",
    { className: "message-box" },
    message
  );
  displayTemporaryElement(messageBox, duration);
}
// Utility method to escape HTML to prevent XSS (Cross-Site Scripting)
//.textContent is safe by itself.
//only use when inserting via .innerHTML
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

//preload a single image
function preloadImage(src, cache = null) {
  //Check if a key exists (src,img) in cache
  if (cache && cache.has(src)) {
    return Promise.resolve(cache.get(src));
  }

  //creating a new instance of a Promise,js built in object
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (cache) {
        cache.set(src, img); //key-value pair
      }
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// preload all level images
export async function preloadImages(imageSources, cache = null) {
  try {
    //Promise.all() runs multiple promises in parallel and waits for all of them to finish
    //If any one of them fails, it rejects the whole thing
    const images = await Promise.all(
      imageSources.map((src) => preloadImage(src, cache))
    );
    console.log(`Successfully preloaded ${images.length} images`);
    return images;
  } catch (error) {
    console.error("Error preloading images:", error);
    throw error;
  }
}

export function calculateDistance(point1, point2) {
  const dx = Math.abs(point1.left - point2.left);
  const dy = Math.abs(point1.top - point2.top);
  return Math.sqrt(dx * dx + dy * dy);
}
