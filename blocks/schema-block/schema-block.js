import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
    const [schemaTypeEl] = block.children;
    const schemaType = schemaTypeEl?.textContent?.trim();
    const schemaArr = schemaType.split(',');

    const brand = "Maruti Suzuki";
    const url = window.location.href;
    let modelCd;
    if(url.includes('grand-vitara')) {
        modelCd = 'GV';
    } else if(url.includes('invicto')) {
        modelCd = 'IN';
    } else if(url.includes('baleno')) {
        modelCd = 'BZ';
    } else if(url.includes('ciaz')) {
        modelCd = 'CI';
    } else if(url.includes('xl6')) {
        modelCd = 'XL';
    } else if(url.includes('jimny')) {
        modelCd = 'JM';
    } else if(url.includes('e-vitara')) {
        modelCd = 'VE';
    } else if(url.includes('ignis')) {
        modelCd = 'IG';
    } else if(url.includes('fronx')) {
        modelCd = 'FR';
    }

    async function fetchData(url) {
        try {
          const response = await fetch(url, {
            method: 'GET',
          });
      
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
      
          const result = await response.json();
          return result.data || [];
        } catch (error) {
          return [];
        }
    }
    
    const { publishDomain } = await fetchPlaceholders();

    function addWebpageSchema(){
        const webpageSchemaJSON = {
            "@context": "https://schema.org/",
            "@type": "Webpage",
            "name": document.head.querySelector('meta[property="og:title"]').content.trim(),
            "url": url.trim()
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(webpageSchemaJSON);
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    function addWebsiteSchema(){
        const websiteSchemaJSON = {
            "@context": "https://schema.org/",
            "@type": "WebSite",
            "name": "Maruti Suzuki India",
            "url": "https://www.marutisuzuki.com/"         
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(websiteSchemaJSON);
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    function addContactUsSchema(){
        const contactUsSchemaJSON = {
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            "contactType": "contact",
            "telephone": "1800-102-6392",
            "email": " contact@nexaexperience.com"
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(contactUsSchemaJSON);
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    async function addCarDetailSchema(){
        const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/carDetailSchema;modelCd=${modelCd};locale=en;?r=15`;
        const response = await fetchData(graphQlEndpoint);
        const result = response?.carModelList?.items[0] ?? {};

        let parsedData = JSON.parse(localStorage.getItem('modelPrice'));

        function getPrice(modelCode) {
            if (parsedData[modelCode] && parsedData[modelCode].price) {
                let price = parsedData[modelCode].price['08'];
                return Math.floor(price);
            } else {
                return '';
            }
        }

        let priceValue = getPrice(modelCd).toString();

        const name = "Maruti Suzuki "+ result.modelDesc;
        const description = document.head.querySelector('meta[name="description"]');
        const image = document.head.querySelector('meta[property="og:image"]');
        
        let colors = new Set();
        let transmissionTypes = new Set();
        let seatingCapacities = new Set();
    
        result.colors.forEach(color => {
            colors.add(color.eColorDesc);
        });
    
        result.variants.forEach(variant => {
            variant.specificationCategory.forEach(category => {
                category.specificationAspect.forEach(aspect => {
                    if (aspect.transmissionType) {
                        transmissionTypes.add(aspect.transmissionType);
                    }
                    if (aspect.seatingCapacity) {
                        seatingCapacities.add(aspect.seatingCapacity);
                    }
                });
            });
        });
    
        transmissionTypes = Array.from(transmissionTypes);
        seatingCapacities = Array.from(seatingCapacities);
    
        const json = {
            "@context": "http://schema.org/",
            "@type": "Car",
            "url": url.trim(),
            "name": name.trim(),
            "description": description.content.trim(),
            "itemCondition": "NewCondition",
            "vehicleModelDate": "2024",
            "model": name.trim(),
            "brand": brand.trim(),
            "manufacturer": {
                "@type": "organization",
                "name": brand+ " India"
            },
            "image": image.content.trim(),
            "mileageFromOdometer": {
                "@type": "QuantitativeValue",
                "unitCode": "KMT"
            },
            "vehicleEngine": {
                "@type": "EngineSpecification",
                "fuelType": result.fuelType
            },
            "numberOfDoors": 4,
            "seatingCapacity": Array.from(seatingCapacities),
            "bodyType": result.bodyType.trim(),
            "vehicleTransmission": Array.from(transmissionTypes),
            "fueltype": result.fuelType,
            "Color": Array.from(colors),
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "price": priceValue.trim(),
                "url": url.trim()
            }
        };
    
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(json);
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    function addHomePageSchema(){
        const homepageSchemaJSON = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Nexa Experience",	
            "alternateName": "Nexa",
            "url": url.trim(),
            "logo": document.head.querySelector('meta[property="og:image"]').content.trim(),
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "1, Nelson Mandela Road,Vasant Kunj, New Delhi - 110070",
                "addressLocality": "Nelson Mandela Road",
                "addressRegion": "Vasant Kunj, New Delhi",
                "postalCode": "110070",
                "addressCountry": "India"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "contact",
                "telephone": "1800-102-6392",
                "email": "contact@nexaexperience.com"
            },
            "sameAs": [
                "https://www.facebook.com/nexaexperience/",
                "https://twitter.com/NEXAExperience",
                "https://www.instagram.com/NEXAexperience/",
                "https://www.linkedin.com/company/nexaexperience",
                "https://www.youtube.com/channel/UCB0CqBMH0bpv5nLXiiJbUJA"
            ]
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(homepageSchemaJSON);
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
    }

    schemaArr.forEach(item => {
       if(item === "carDetail"){
        addCarDetailSchema();
       }else if(item === "homepage"){
        addHomePageSchema();
       }else if(item === "website"){
        addWebsiteSchema();
       }else if(item === "webpage"){
        addWebpageSchema();
       }else{
        addContactUsSchema();
       }
    });    

    block.innerHTML = '';
}