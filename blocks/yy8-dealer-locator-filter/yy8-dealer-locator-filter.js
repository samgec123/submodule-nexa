import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import ctaUtils from '../../utility/ctaUtils.js';
import apiUtils from '../../utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const currentUrl = new URL(window.location.href); // Get the current URL
  const {
    allCarText,
    mapmyindiaKey,
    mapmyindiaUrl,
    publishDomain,
    apiExShowroomDetail,
    apiDealerOnlyCities,
    apiNearestDealers,
    mapmyindiaMapviewUrl,
    mapmyindiaMapviewMarkerUrl,
    defaultCityName,
    defaultForCode,
    apiForChargeListLocations
  } = await fetchPlaceholders();
  const [
    stateTextEl,
    powertypeTextEl,
    cityTextEl,
    directionCtaTextEl,
    directionCtaLinkEl,
    directionCtaTargetEl,
    mapHeadingEl,
    locationMarkerIconEl,

  ] = block.children;
  const stateText = stateTextEl?.textContent?.trim();
  const powertypeText = powertypeTextEl?.textContent?.trim();

  const cityText = cityTextEl?.textContent?.trim();
  const mapHeading = mapHeadingEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  const locationMarkerIconSrc = locationMarkerIconEl?.querySelector('img')?.src || null;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const primaryDirectionCta = ctaUtils.getLink(
    directionCtaLinkEl,
    directionCtaTextEl,
    directionCtaTargetEl,
  );

  const directionLinkPlaceholder = directionCtaLinkEl?.querySelector('a')?.href;

  
 // Fetch and populate states
 async function fetchStates() {
  const apiUrl = 'https://dev-nexa.marutisuzuki.com/masterdata/v1/common/CommonMasterData/states-brief';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch state data');
    const data = await response.json();
    if (data.error || !data.data) throw new Error('Invalid state data structure');

    const states = data.data;
    populateDropdown('stateDropdown', states, 'STATE_CD', 'STATE_DESC');

    // Default select "Delhi" if available
    const stateDropdown = document.querySelector('.stateDropdown-block .select-selected');
    const stateOptions = document.querySelectorAll('.stateDropdown-block .select__option');
    stateOptions.forEach((option) => {
      if (option.textContent === 'DELHI') {
        stateDropdown.textContent = option.textContent;
        stateDropdown.dataset.value = option.dataset.value;
      }
    });

    // Fetch cities for default selected state
    fetchCities(stateDropdown.dataset.value, 'DELHI');
  } catch (error) {
    console.error('Error fetching states:', error);
  }
}

// Fetch and populate cities
async function fetchCities(stateCode = '', defaultCity = '') {
  const apiUrl = 'https://dev-nexa.marutisuzuki.com/masterdata/v1/common/CommonMasterData/cities-brief';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch city data');
    const data = await response.json();
    if (data.error || !data.data) throw new Error('Invalid city data structure');

    const filteredCities = stateCode
      ? data.data.filter((city) => city.stateCd === stateCode)
      : data.data;

    populateDropdown('cityDropdown', filteredCities, 'cityCd', 'cityDesc');

    // Default select "Delhi" if available
    const cityDropdown = document.querySelector('.cityDropdown-block .select-selected');
    const cityOptions = document.querySelectorAll('.cityDropdown-block .select__option');
    cityOptions.forEach((option) => {
      if (option.textContent === defaultCity) {
        cityDropdown.textContent = option.textContent;
        cityDropdown.dataset.value = option.dataset.value;
      }
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
  }
}

// Reset city dropdown to "Select" when state is changed
function resetCityDropdown() {
  const cityDropdown = document.querySelector('#cityDropdown .select-selected');
  cityDropdown.textContent = 'Select';  // Reset city text
  cityDropdown.dataset.value = '';  // Reset the city value
  const cityOptions = document.querySelectorAll('#cityDropdown .select__option');
  cityOptions.forEach((option) => {
    option.classList.remove('selected');
  });
}

// Fetch dealer data
async function fetchDealers(state, city, powerType) {
  const apiUrl = `${publishDomain}${apiForChargeListLocations}`;
  const requestBody = { state, city, Power_type: powerType };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { accept: '*/*', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error('Failed to fetch dealer data');

    const data = await response.json();
    if (data && data.data && data.data.stationList && Array.isArray(data.data.stationList)) {
      const dealers = data.data.stationList;
      const dealersContainer = document.querySelector('.dealers-container .dealer-cards');
      dealersContainer.innerHTML = '';
      dealers.forEach((dealer) => {
        const operatorName = dealer.Operator  || 'Unknown Operator'; // Handle undefined
        const dealerCard = buildDealerCard(dealer);
        dealersContainer.innerHTML += dealerCard;
         // After loading dealer, set up the direction CTA link with correct lat/long
         updateDirectionLink(dealer);
      });
              // After loading dealers, set up the map with the dealer locations
              setMapView(dealers);
    } else {
      console.error('Unexpected response structure:', data);
    }
  } catch (error) {
    const dealersContainer = document.querySelector('.dealers-container');
    dealersContainer.innerHTML = `<div class="text-center">Error in fetching data</div>`;
    console.error('Error fetching dealer data:', error);
  }
}

// Function to update the direction CTA link with latitude and longitude from the dealer API
function updateDirectionLink(dealer) {
  if (dealer?.latitude && dealer?.longitude) {
    // Get the direction CTA element for the specific dealer
    const directionCtaLink = document.querySelector(`.dealer-card[dealer-id="${dealer.Postal_code}"] .action-cta`);
    
    if (directionCtaLink) {
      // Construct the navigation link (e.g., for Google Maps)
      const navigationLink = decodeURI(directionLinkPlaceholder)
        .replace('{latitude}', dealer.latitude)
        .replace('{longitude}', dealer.longitude)
        .replace('{dealer-name}', dealer.Operator)

      
      // Update the href and title attributes of the CTA link
      primaryDirectionCta?.setAttribute('href', navigationLink);
      primaryDirectionCta?.setAttribute('title', directionCtaTextEl?.textContent?.trim() || '');
    }
  }
}

// Populate dropdown
function populateDropdown(id, items, valueKey, labelKey) {
  const dropdownOptions = document.querySelector(`.${id}-block .select-items`);
  if (!dropdownOptions) {
    console.error(`Dropdown with class '${id}' not found.`);
    return;
  }
  dropdownOptions.innerHTML = '';
  items.forEach((item) => {
    const optionWrapper = document.createElement('div');
    optionWrapper.className = 'custom-option';
    const option = document.createElement('div');
    option.className = 'select__option';
    option.dataset.value = item[valueKey];
    option.textContent = item[labelKey];
    optionWrapper.appendChild(option);
    dropdownOptions.appendChild(optionWrapper);
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

async function setMapView(allDealerList) {
  const mapViewer = block.querySelector('.map-container');

  // Ensure mapViewer has an ID for Mappls SDK to target
  if (!mapViewer.id) {
    mapViewer.id = 'map';
  }
  // Load the Mappls SDK scripts
  const mapSdkUrl = `${mapmyindiaMapviewUrl}`;
  const mapSdkPluginsUrl = `${mapmyindiaMapviewMarkerUrl}`;

  try {
    await loadScript(mapSdkUrl); // Load the main Mappls SDK
    await loadScript(mapSdkPluginsUrl); // Load the Mappls plugins

    mapViewer.style.display = 'block';

    // Initialize the map
    /* global mappls */
    const map = new mappls.Map(mapViewer.id, {
      center: [allDealerList[0]?.latitude, allDealerList[0]?.longitude],
      zoom: 10,
    });

    map.addListener('load', () => {
      const styles = mappls.getStyles();
      // Set the first style as default
      mappls.setStyle(styles[0].name);
      // Add markers for each dealer
      allDealerList.forEach((dealer) => {
        if (dealer?.latitude && dealer?.longitude) {
          mappls.Marker({
            map,
            position: [dealer?.latitude, dealer?.longitude],
            icon: locationMarkerIconSrc,
            width: 40,
            height: 40,
          });
        } else {
          console.error('Missing latitude or longitude for dealer:', dealer);
        }
      });
    });
  } catch (error) {
    console.error('Error loading Mappls SDK:', error);
    mapViewer.innerText = 'Failed to load map. Please try again later.';
  }
}

// Build dealer card
function buildDealerCard(dealer) {
  return `
    <div class="dealer-card" dealer-id="${dealer.Postal_code}">
      <div class="dealer-card-content">
        <div class="dealer-title">
          <span class="dealer-title-text">${dealer.Operator}</span>
        </div>
        <div class="dealer-location">
          <div class="dealer-address">${dealer.Address}, ${dealer.City}, ${dealer.State}, ${dealer.Postal_code}</div></div> <div class="dealer-location">
            <div class="dealer-address">Power - ${dealer.max_electric_power}W | ${dealer.power_type}</div>
                            <div class="action-cta">
            ${primaryDirectionCta?.outerHTML}
           <span class="arrow-icon"></span>
           </div>
        </div>

      </div>
    </div>`;
}

// Create dropdown HTML
function createCustomDropdown(id, label, defaultOption = 'Select') {
  return `
    <div class="filter-group ${id}-block">
      <label for=${id}>${label}</label>
      <custom-select id=${id} name=${id}>
        <div class="select-selected">${defaultOption}</div>
        <div class="select-items select-hide"></div>
      </custom-select>
    </div>`;
}

// Build map HTML
const mapHtml = `
  <div class="map-header">
    <span>${mapHeading?.outerHTML}</span>
  </div>`;

// Create dropdowns
block.innerHTML = utility.sanitizeHtml(`
  <section class="dealer-locator">
      ${mapHtml}
      <div class="dealer-locator-container">
          <div class="filter-container">
              ${createCustomDropdown('stateDropdown', stateText)}
              ${createCustomDropdown('cityDropdown', cityText)}
              <div class="filter-group powertype-block">
                  <label for="powertype">${powertypeText}</label>
                  <custom-select id="powertype" name="powertype">
                    <div class="select-selected">Select All</div>
                    <div class="select-items select-hide">
                      <div class="custom-option"><span class="select__icon"></span><div class="select__option">Select All</div></div>
                      <div class="custom-option"><span class="select__icon"></span><div class="select__option">AC</div></div>
                      <div class="custom-option"><span class="select__icon"></span><div class="select__option">DC</div></div>
                    </div>
                  </custom-select>
              </div>
              <button class="search-button">${isMobile ? 'Search' : ''}</button>
          </div>
          <div class="dealers-container mapView">
              <div class="dealer-cards"></div>
              <div class="map-container"></div>
          </div>
      </div>
  </section>`);

// Initialize and set up listeners
async function initializeDealerLocator() {
  await fetchStates();
  const stateDropdown = document.querySelector('#stateDropdown .select-selected');
  const cityDropdown = document.querySelector('#cityDropdown .select-selected');
  const powerTypeDropdown = document.querySelector('#powertype .select-selected');

  const defaultState = stateDropdown.dataset.value || 'DELHI';
  const defaultCity = cityDropdown.dataset.value || 'DELHI';
  const defaultPowerType = powerTypeDropdown.dataset.value || 'Select All';

  fetchDealers(defaultState, defaultCity, defaultPowerType);
}

function setupDropdownListeners() {
  document.querySelectorAll('.filter-group').forEach((dropdown) => {
    const selected = dropdown.querySelector('.select-selected');
    const options = dropdown.querySelector('.select-items');
    selected.addEventListener('click', () => {
      closeAllDropdowns();
      options.classList.toggle('select-hide');
      options.classList.toggle('select-show');
    });
    options.addEventListener('click', (event) => {
      const option = event.target.closest('.custom-option');
      if (option) {
        const selectedOption = option.querySelector('.select__option');
        selected.textContent = selectedOption.textContent;
        selected.dataset.value = selectedOption.dataset.value;
        options.classList.remove('select-show');
        options.classList.add('select-hide');

        if (dropdown.classList.contains('stateDropdown-block')) {
            // Reset the city dropdown when state is changed
            resetCityDropdown();
          fetchCities(selectedOption.dataset.value, 'DELHI');
        } else {
         // updateDealersBasedOnSelection();
          setupSearchButton(); 

        }
      }
    });
  });
}

// Add an event listener to the "Search" button
function setupSearchButton() {
  const searchButton = document.querySelector('.search-button');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      updateDealersBasedOnSelection(); // Trigger the fetchDealers function based on the selected values
    });
  }
}

function updateDealersBasedOnSelection() {
  const selectedState = document.querySelector('#stateDropdown .select-selected').dataset.value || '';
  const selectedCity = document.querySelector('#cityDropdown .select-selected').dataset.value || '';
  const selectedPowerType = document.querySelector('#powertype .select-selected')?.textContent || 'Select All';

  fetchDealers(selectedState, selectedCity, selectedPowerType);
}

function closeAllDropdowns() {
  document.querySelectorAll('.select-items').forEach((options) => {
    options.classList.remove('select-show');
    options.classList.add('select-hide');
  });
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('.filter-group')) {
    closeAllDropdowns();
  }
});

initializeDealerLocator();
setupDropdownListeners();

}
