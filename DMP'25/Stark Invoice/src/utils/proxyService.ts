// Proxy service for handling CORS-restricted images

/**
 * Converts an image URL to base64 using a proxy service
 * This is a fallback for when direct fetch fails due to CORS
 */
export const convertImageUrlToBase64ViaProxy = async (
  imageUrl: string
): Promise<string> => {
  try {
    // Option 1: Use a public CORS proxy service
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      `https://cors-anywhere.herokuapp.com/${imageUrl}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(imageUrl)}`,
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () =>
              reject(new Error("Failed to read proxied image"));
            reader.readAsDataURL(blob);
          });
        }
      } catch (proxyError) {
        console.log(`Proxy ${proxyUrl} failed:`, proxyError);
        continue; // Try next proxy
      }
    }

    throw new Error("All proxy services failed");
  } catch (error) {
    console.error("Proxy conversion failed:", error);
    throw new Error("Could not load image via proxy services");
  }
};

/**
 * Downloads image using canvas and Image element (works for many CORS cases)
 */
export const downloadImageAsBase64 = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Set up CORS handling
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Convert to base64
        const dataURL = canvas.toDataURL("image/png", 0.9);
        resolve(dataURL);

        // Clean up
        canvas.remove();
      } catch (canvasError) {
        reject(
          new Error("Failed to convert image to canvas: " + canvasError.message)
        );
      }
    };

    img.onerror = () => {
      // Try without CORS if initial attempt fails
      const img2 = new Image();
      img2.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not create canvas context"));
            return;
          }

          canvas.width = img2.naturalWidth || img2.width;
          canvas.height = img2.naturalHeight || img2.height;
          ctx.drawImage(img2, 0, 0);

          const dataURL = canvas.toDataURL("image/png", 0.9);
          resolve(dataURL);
          canvas.remove();
        } catch (error) {
          reject(new Error("Canvas conversion failed: " + error.message));
        }
      };

      img2.onerror = () => {
        reject(new Error("Image failed to load even without CORS"));
      };

      img2.src = imageUrl;
    };

    img.src = imageUrl;
  });
};
