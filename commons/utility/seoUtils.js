import { getMetadata } from "../scripts/aem.js";

const seoUtils = {
  getJSON: async () => {
    const carModelName = getMetadata("carmodelname");
    const vin = "XYZ12345VIN";
    const imageUrl = getMetadata("imageurl");
    const carUrl = "pageUrl";
    const price = "1234";
    const priceCurrency = getMetadata("pricecurrency");
    const brandName = getMetadata("brandname");
    const trim = getMetadata("trim");
    const modelYear = getMetadata("modelyear");
    const unitCode = "KM";
    const color = "Red";
    const interiorColor = "Beige";
    const interiorType = "Leather";
    const bodyType = "SUV";
    const fuelType = "Petrol";
    const transmissionType = getMetadata("transmissiontype");
    const numberOfDoors = 5;
    const seatingCapacity = 7;

    // Construct the JSON-LD data with dynamic values
    let jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": carModelName
    };

    // Inject the JSON-LD data into the document
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLdData);
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onerror = reject;
      // document.head.appendChild(script);
      resolve();
    });
  }
};

export default seoUtils;
