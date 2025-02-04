import { dispatchLocationChangeEvent } from '../../scripts/customEvents.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [titleEl, noCityFoundMsgEl, dylTextEl, searchTextEl, citiesEl] = block.children;
  const title = titleEl?.textContent?.trim() || null;
  const errorMessageHTML = noCityFoundMsgEl?.innerHTML || null;
  const dylText = dylTextEl?.textContent?.trim() || null;
  const searchText = searchTextEl?.textContent?.trim() || null;
  const citiesList = citiesEl?.textContent?.trim() || null;
  const cities = citiesList && citiesList.split(',');
  const defaultLocation = utility.getSelectedLocation();
  const currentUrl = new URL(window.location.href); // Get the current URL
  const cityQueryName = currentUrl.searchParams.get('city') || ''; // Get 'city'
  block.innerHTML = utility.sanitizeHtml(`
    <button class="location-btn" data-forcode="${defaultLocation?.forCode ?? '08'}" data-state-code="${defaultLocation?.stateCode ?? 'DL'}" data-city-name="${defaultLocation?.cityName ?? 'Delhi'}">
    <span>${defaultLocation?.cityName ?? 'Delhi'}</span>
    </button>
    <div class="geo-location hidden">
      ${title ? `<div class="geo-location_heading" ><p class="geo-location__text">${title}</p> <span class='close__icon'></span></div>` : ''}
      
      <div class="detect-location">
        <div class="detect-location__box">
          ${dylText ? `
          <div class="detect-location__cta">
            <p class="detect-location__text">${dylText}</p>
          </div>` : ''}
          
          <div class="top__cities"></div>
        </div>
  
        <p class="separator">or</p>
  
        <div class="search-location">
          <div class="search-box">
            ${searchText ? `<input type="text" placeholder="${searchText}" class="search" />` : ''}
          </div>
          ${errorMessageHTML ? `<div class="error-message">${errorMessageHTML}</div>` : ''}
          <div class="suggested-places"></div>
        </div>
      </div>
    </div>
  `);

  const detectLocationCTA = block.querySelector('.detect-location__cta');
  let citiesObject = {};

  function toTitleCase(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function sentenceToTitleCase(sentence) {
    sentence = sentence.trim();
    if (!sentence.includes(' ')) {
      return toTitleCase(sentence);
    }
    return sentence.split(' ').map(toTitleCase).join(' ');
  }
  function processData(data) {
    citiesObject = data?.reduce((acc, item) => {
        if(item.cityDesc) {
          item.cityDesc = sentenceToTitleCase(item.cityDesc);
          acc[item.cityDesc] = {
            cityDesc: item.cityDesc,
            cityCode: item.cityCode,
            latitude: item.latitude,
            longitude: item.longitude,
            forCode: item.forCode,
            stateCode: item.stateCode,
          };
        }
        return acc;
    }, {});
    return citiesObject;
  }

  function toggleErrorMessage(show) {
    const errorMessage = block.querySelector('.error-message');
    if (show) {
      errorMessage.style.display = 'flex';
    } else {
      errorMessage.style.display = 'none';
    }
  }

  const setLinkDetails = (e, cityName) => {
    const pageDetails = {};

    pageDetails.componentName = block.getAttribute('data-block-name');
    pageDetails.componentTitle = e.textContent.trim();
    pageDetails.componentType = 'link';
    pageDetails.webName = `City:${cityName ?? e.textContent.trim()}`;
    pageDetails.linkType = e;

    analytics.setHeaderNavigation(pageDetails);
  };

  // Populate All Cities for Suggested Places
  function populateAllCities() {
    const suggestedPlaces = block.querySelector('.suggested-places');
    suggestedPlaces.innerHTML = ''; // Clear existing suggestions

    if (Object.keys(citiesObject).length === 0) {
      toggleErrorMessage(true);
    } else {
      toggleErrorMessage(false);

      Object.keys(citiesObject).forEach((cityName) => {
        const p = document.createElement('p');
        p.textContent = cityName;
        p.className = 'suggested__city';
        p.setAttribute('data-forcode', citiesObject[cityName].forCode);
        p.setAttribute('data-state-code', citiesObject[cityName].stateCode);
        suggestedPlaces.appendChild(p);
      });
    }
    suggestedPlaces.style.display = 'none'; // Hide it initially
  }

  // Filtered Cities based on Search Input
  function filterCities(input) {
    const suggestedPlaces = block.querySelector('.suggested-places');
    suggestedPlaces.innerHTML = '';

    const filteredCities = Object.keys(citiesObject).filter((cityName) => new RegExp(`^${input}`, 'i').test(cityName));

    if (filteredCities.length === 0) {
      toggleErrorMessage(true);
      suggestedPlaces.style.display = 'none'; // Hide if no results
    } else {
      toggleErrorMessage(false);
      suggestedPlaces.style.display = 'flex'; // Show the div when typing
      filteredCities.forEach((cityName) => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${cityName.substring(0, input.length)}</strong>${cityName.substring(input.length)}`;
        p.className = 'suggested__city';
        p.setAttribute('data-forcode', citiesObject[cityName].forCode);
        p.setAttribute('data-state-code', citiesObject[cityName].stateCode);
        if (block.querySelector('.location-btn')?.textContent.trim() === cityName || block.querySelector('.location-btn').dataset.cityName === cityName) {
          p.classList.add('active-city');
        }
        suggestedPlaces.appendChild(p);
      });
    }
  }

  // Function to calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos((lat1 * Math.PI) / 180)
        * Math.cos((lat2 * Math.PI) / 180)
        * Math.sin(dLon / 2)
        * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  function clearSearchInput() {
    const searchInput = block.querySelector('.search');
    searchInput.value = '';
    const searchResults = block.querySelector('.suggested-places');
    searchResults.style.display = 'none';
  }
  // Function to toggle the active class for the top cities
  function toggleActiveCity(forCode) {
    const previousActiveTopCity = block.querySelector('.top__cities .active');
    if (previousActiveTopCity) {
      previousActiveTopCity.classList.remove('active');
    }
    const selectedTopCity = block.querySelector(`.top__cities p[data-forcode="${forCode}"]`);
    if (selectedTopCity) {
      selectedTopCity.classList.add('active');
    }
  }
  const errorMessageDiv = block.querySelector('.error-message');
  function hideOverlay() {
    const header = document.querySelector('header');
    const overlayContainer = document.querySelector('.overlay');
    overlayContainer.style.display = 'none';
    header?.classList.remove('lift-up');
    document.documentElement.classList.remove('no-scroll');

    clearSearchInput();
    errorMessageDiv.style.display = 'none';
  }

  function showOverlay() {
    const header = document.querySelector('header');
    const overlayContainer = document.querySelector('.overlay');
    overlayContainer.style.display = 'block';
    header?.classList.add('lift-up');
    document.documentElement.classList.add('no-scroll');
  }
  const geoLocationDiv = block.querySelector('.geo-location');

  // Function to update Location Button with the selected city
  function updateLocationButton(cityName, forCode, locationObj, stateCode) {
    utility.setLocalStorage({ cityName, forCode, location: locationObj, stateCode }, 'selected-location');
    let cityText = cityName;
    const locationButton = block.querySelector('.location-btn');
    const locationButtonSpan = block.querySelector('.location-btn span');
    locationButtonSpan.textContent = cityText;
    locationButton.setAttribute('data-forcode', forCode);
    locationButton.setAttribute('data-state-code', stateCode);
    locationButton.setAttribute('data-city-name', cityName);
    dispatchLocationChangeEvent(forCode, locationObj);

    toggleActiveCity(forCode);
    geoLocationDiv.classList.toggle('hidden');

    clearSearchInput();
    hideOverlay();
  }

  // Function to auto-select the nearest city based on user's location
  function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let forCode = null;
    let stateCode = null;
    let minDistance = Infinity;
    const locationObj = {};

    // Iterating over all cities and logging latitude and longitude
    Object.keys(citiesObject).forEach((cityName) => {
      const cityLatitude = citiesObject[cityName].latitude;
      const cityLongitude = citiesObject[cityName].longitude;
      const distance = calculateDistance(
        latitude,
        longitude,
        cityLatitude,
        cityLongitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
        forCode = citiesObject[cityName].forCode;
        stateCode = citiesObject[cityName].stateCode;
        locationObj.latitude = cityLatitude;
        locationObj.longitude = cityLongitude;
      }
    });
    // Update the nearest city in the dropdown
    updateLocationButton(nearestCity, forCode, locationObj, stateCode);
    setLinkDetails(detectLocationCTA, nearestCity);
  }
  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    autoSelectNearestCity(lat, lon);
  }
  function requestLocationPermission() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        showPosition(position);
      });
    }
  }

  const filteredData = await apiUtils.getDealerCityList();
  citiesObject = processData(filteredData);
  const locationButton = block.querySelector('.location-btn');
  locationButton.classList.add('no-overlay', 'overlay_click');
  const topCities = block.querySelector('.top__cities');

  // Close geo-location when clicking outside of it
  document.addEventListener('click', (e) => {
    if (!geoLocationDiv.contains(e.target) && !locationButton.contains(e.target) && document.querySelector('.geo-location') && !document.querySelector('.geo-location').className.includes('hidden')) {
      geoLocationDiv.classList.add('hidden');

      hideOverlay();
    }
  });

  cities && cities.forEach((cityCode) => {
    const obj = Object.keys(citiesObject).find(
      (key) => citiesObject[key].forCode === cityCode,
    );
    const stateCode = citiesObject[obj].stateCode;
    const p = document.createElement('p');
    p.className = 'selected__top__city';
    p.textContent = obj;
    p.setAttribute('data-forcode', cityCode);
    p.setAttribute('data-state-code', stateCode);
    topCities.appendChild(p);
  });

  populateAllCities();

  const searchInput = block.querySelector('.search');
  searchInput.addEventListener('input', (e) => {
    const inputValue = e.target.value.trim();
    if (inputValue === '') {
      populateAllCities();
    } else {
      filterCities(inputValue);
    }
  });

  function handleLocationButtonClick(event) {
    event.preventDefault();
    document.querySelector('.sign-in-wrapper')?.classList.add('hidden');
    if (geoLocationDiv) {
      geoLocationDiv.classList.toggle('hidden');
    } else {
      console.error('Geo-location div not found');
    }
    if (geoLocationDiv?.classList.contains('hidden')) {
      hideOverlay();
    } else {
      showOverlay();
    }
  }

  // Use event delegation on the document body
  document.body.addEventListener('click', (event) => {
    // eslint-disable-next-line
    const locationButton = event.target.closest('.location-btn');
    if (locationButton) {
      handleLocationButtonClick(event);
    }
  });

  detectLocationCTA.addEventListener('click', () => {
    requestLocationPermission();
  });

  // Event listener for suggested city click
  const suggestedPlaces = block.querySelector('.suggested-places');
  suggestedPlaces.addEventListener('click', (e) => {
    const cityElement = e.target.closest('.suggested__city');
    if (cityElement) {
      const selectedCity = e.target?.textContent.trim();
      const selectedForCode = e.target.getAttribute('data-forcode');
      const selectedStateCode = e.target.getAttribute('data-state-code');
      const locationObj = {
        latitude: citiesObject[selectedCity].latitude,
        longitude: citiesObject[selectedCity].longitude,
      };
      const previouslyActiveCity = block.querySelector('.suggested__city.active-city');
      if (previouslyActiveCity) {
        previouslyActiveCity.classList.remove('active-city');
      }

      e.target.classList.add('active-city');
      updateLocationButton(selectedCity, selectedForCode, locationObj, selectedStateCode);
      setLinkDetails(e.target);
    }
  });

  // Add click event to top cities
  topCities.addEventListener('click', (e) => {
    if (e.target.classList.contains('selected__top__city')) {
      const selectedCity = e.target?.textContent;
      const selectedForCode = e.target.getAttribute('data-forcode');
      const selectedStateCode = e.target.getAttribute('data-state-code');
      const locationObj = {
        latitude: citiesObject[selectedCity].latitude,
        longitude: citiesObject[selectedCity].longitude,
      };
      updateLocationButton(selectedCity, selectedForCode, locationObj, selectedStateCode);
      setLinkDetails(e.target);
    }
  });

  const closeLocation = block.querySelector('.close__icon');
  closeLocation.addEventListener('click', () => {
    geoLocationDiv.classList.toggle('hidden');
    hideOverlay();
  });

  searchInput.addEventListener('input', (e) => {
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      populateAllCities();
      suggestedPlaces.style.display = 'none';
    } else {
      filterCities(inputValue);
    }
  });
  const defaultForCode = block.querySelector('.location-btn')?.getAttribute('data-forcode');
  toggleActiveCity(defaultForCode);
  if(cityQueryName) {
    let queryCityObj = {};
    for (const key in citiesObject) {
      if (key.toLowerCase() === cityQueryName.toLowerCase()) {
        queryCityObj = citiesObject[key];
        const locationObj = {
                    latitude: queryCityObj.latitude,
                    longitude: queryCityObj.longitude,
                  };
            updateLocationButton(queryCityObj.cityDesc, queryCityObj.forCode, locationObj, queryCityObj.stateCode);
        break;
      }
    }
      }
}
