import {
  fetchPlaceholders,
} from '../../commons/scripts/aem.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';
import initCarousel from './variantUtil.js';
import ctaUtils from '../../utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [
    idEl,
    modelCdEl,
    titleEl,
    subtitleEl,
    powertrainsEl,
    priceTextEl,
    selectVariantEl,
    filterSelectEl,
    compareCtaTextEl,
    compareCtaLinkEl,
    compareCtaTargetEl,
    buildCtaTextEl,
    buildCtaLinkEl,
    buildCtaTargetEl,
    carCountTextEl,
    featuringTextEl,
    transmissionTextEl,
    automaticLabelEl,
    manualLabelEl,
    termsConditionEl,
  ] = block.children;

  const {
    publishDomain,
    apiExShowroomDetail,
    allFilterText,
  } = await fetchPlaceholders();

  let forCode = utility.getSelectedLocation()?.forCode ?? '08';

  const id = idEl?.textContent?.trim() || null;
  const localModelCode = modelCdEl?.textContent?.trim() || null;
  const title = titleEl?.textContent?.trim();
  const subtitle = subtitleEl?.textContent?.trim();
  const priceText = priceTextEl?.textContent?.trim();
  const powertrainText = powertrainsEl?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const filterSelectedText = filterSelectEl?.textContent?.trim() || 'variantTechnology';
  const compareCta = ctaUtils.getLink(compareCtaLinkEl, compareCtaTextEl, compareCtaTargetEl, 'btn-secondary');
  const buildCta = ctaUtils.getLink(buildCtaLinkEl, buildCtaTextEl, buildCtaTargetEl, 'btn-primary');
  const carCountText = carCountTextEl?.textContent?.trim() || '';
  const featuringText = featuringTextEl?.textContent?.trim() || '';
  const transmissionText = transmissionTextEl?.textContent?.trim() || '';
  const automaticLabel = automaticLabelEl?.textContent?.trim() || '';
  const manualLabel = manualLabelEl?.textContent?.trim() || '';
  const termsConditionLabel = termsConditionEl?.textContent?.trim() || '';
  let selectedRadio = 'Automatic';
  const isMobile = window.matchMedia('(width < 768px)').matches;
  const href = new URLSearchParams(window.location.search);
  let selectedFilter;

  const apiUrl = new URL(publishDomain + apiExShowroomDetail);
  apiUrl.searchParams.append('variantInfoRequired', 'true');

  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantFeaturesList;modelCd=${localModelCode};locale=en;`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let cars = [];
  let newHTMLContainer = document.createElement('div');

  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function initializeLocalStorage(apiUrlParam, forCodeParam, modelCodeParam) { // Renamed to avoid shadowing
    const url = new URL(apiUrlParam);
    url.searchParams.append('forCode', forCodeParam);
    url.searchParams.append('channel', componentVariation === 'arena-variant' ? 'NRM' : 'EXC');
    url.searchParams.append('modelCodes', modelCodeParam);

    try {
      const storedData = localStorage.getItem('variantsPrice');
      const storageData = storedData ? JSON.parse(storedData) : {};

      if (!storageData[modelCodeParam]) {
        storageData[modelCodeParam] = {
          modelCd: modelCodeParam,
          variants: {}
        };
      }

      const response = await fetch(url.href, { method: 'GET' });
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (data.error === false && data.data) {
        const fetchedVariants = data.data.models[0].exShowroomDetailResponseDTOList;

        fetchedVariants.forEach((item) => {
          const { variantCd, exShowroomPrice } = item;

          if (!storageData[modelCodeParam].variants[variantCd]) {
            storageData[modelCodeParam].variants[variantCd] = {
              price: {
                [forCodeParam]: exShowroomPrice,
              },
              timestamp: new Date().getTime() + (1 * 24 * 60 * 60 * 1000),
            };
          } else {
            const existingVariant = storageData[modelCodeParam].variants[variantCd];
            if (existingVariant.price[forCodeParam] > exShowroomPrice) {
              existingVariant.price[forCodeParam] = exShowroomPrice;
              existingVariant.timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);
            }
          }
        });

        localStorage.setItem('variantsPrice', JSON.stringify(storageData));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  const storedPrices = getLocalStorage('variantsPrice');
  if (!storedPrices) {
    await initializeLocalStorage(apiUrl, forCode, localModelCode);
  }

  if (storedPrices) {
    if (storedPrices[localModelCode]) {
      const {
        variants,
      } = storedPrices[localModelCode];
      const priceKeyExists = Object.values(variants).some((variant) => variant.price && variant.price[forCode] !== undefined);
      if (!priceKeyExists) {
        await initializeLocalStorage(apiUrl, forCode, localModelCode);
      }
    } else {
      await initializeLocalStorage(apiUrl, forCode, localModelCode);
    }
  }

  function priceFormatting(price) {
    if (componentVariation === 'arena-variant') {
      return utility.formatToLakhs(price);
    }
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    return `₹ ${formatter.format(price).replace('₹', '').replaceAll(',', ' ')}/-`;;
  }

  async function fetchAndUpdatePrice(modelCodeParam, variantCdParam, priceElement, priceTextElement) {
    const localStoredPrices = getLocalStorage('variantsPrice') || {};
    const modelPrices = localStoredPrices[modelCodeParam] || {};
    if (!modelPrices?.variants[variantCdParam]) {
      priceElement.style.display = 'none';
      return;
    }

    const variantData = modelPrices.variants[variantCdParam];
    const storedPrice = variantData.price[forCode];
    const expiryTimestamp = variantData.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
      return;
    }

    const params = {
      forCode,
      channel: componentVariation === 'arena-variant' ? 'NRM' : 'EXC',
      modelCode: modelCodeParam,
      variantCd: variantCdParam,
    };

    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.href, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error === false && data.data) {
        const modelData = data.data?.models?.find((item) => item.modelCd === modelCodeParam);

        if (modelData) {
          const newPrice = modelData.lowestExShowroomPrice;
          const timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);

          if (!localStoredPrices[modelCodeParam].variants) {
            localStoredPrices[modelCodeParam].variants = {};
          }
          localStoredPrices[modelCodeParam].variants[variantCdParam] = {
            price: {
              [forCode]: newPrice,
            },
            timestamp,
          };

          setLocalStorage('variantsPrice', localStoredPrices);

          priceTextElement.textContent = priceText;
          priceElement.textContent = priceFormatting(newPrice);
        } else {
          priceElement.style.display = 'none';
        }
      } else {
        priceElement.style.display = 'none';
      }
    } catch (error) {
      console.error('Fetch error:', error);
      priceElement.style.display = 'none';
    }
  }

  async function fetchPrice(modelCodeParam, variantCdParam, priceElement, priceTextElement) {
    const localStoredPrices = getLocalStorage('variantsPrice') || {};
    const modelData = localStoredPrices[modelCodeParam] || {};
    if (!modelData?.variants) {
      priceElement.style.display = 'none';
      return;
    }

    const variantCd = variantCdParam;
    const variantData = modelData.variants[variantCd];
    if (!variantData?.price) {
      priceElement.style.display = 'none';
      return;
    }

    const storedPrice = variantData.price[forCode];
    const expiryTimestamp = variantData.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
    } else {
      await fetchAndUpdatePrice(modelCodeParam, variantCdParam, priceElement, priceTextElement);
    }
  }

  function getFilterTypeFromHref(filterTypeFromHref, unifiedFilterOptions) {
    if (unifiedFilterOptions.indexOf(filterTypeFromHref) > -1) {
      return filterTypeFromHref;
    }
    return allFilterText;
  }

  async function carModelInfo(result) {
    cars = result.data.carModelList.items[0].variants;
    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    const labelsResult = (await apiUtils.getCarLabelsList())[0];
    const newContainer = document.createElement('div');
    newContainer.classList.add('variant-filter-cars');

    let manualRadioHtml = '';
    let automaitcRadioHtml = '';

    if (automaticLabel) {
      automaitcRadioHtml = `
        <label class="radio-label">
              <input type="radio" class="custom-radio" name="transmission" value="Automatic">
              <img src="${window.hlx.codeBasePath}/icons/radio-unchecked.svg" alt="Unchecked" class="radio-icon unchecked">
              <img src="${window.hlx.codeBasePath}/icons/radio-checked.svg" alt="Checked" class="radio-icon checked">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                <circle cx="8.19043" cy="8" r="7.5" stroke="#767879"/>
              </svg>
              <span class="radio-label-text">${automaticLabel}</span>
        </label>
      `;
    }

    if (manualLabel) {
      manualRadioHtml = `
        <label class="radio-label">
            <input type="radio" class="custom-radio" name="transmission" value="Manual">
            <img src="${window.hlx.codeBasePath}/icons/radio-unchecked.svg" alt="Unchecked" class="radio-icon unchecked">
            <img src="${window.hlx.codeBasePath}/icons/radio-checked.svg" alt="Checked" class="radio-icon checked">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <circle cx="8.19043" cy="8" r="7.5" stroke="#767879"/>
            </svg>
            <span class="radio-label-text">${manualLabel}</span>
        </label>
      `;
    }

    newContainer.innerHTML = `
       <div class="variant-filter-text">
           <h2 class="title">${title}</h2>
           <div class="subtitle">${subtitle}</div>
       </div>
       <div class="variant-filter-section">
       <p class="filter-prev-arrow"></p> 
        <div class="car-variant-filter-left">
          <div class="title">${powertrainText}</div>
          <div class="car-variant-filter-list"></div>
        </div>
        <p class="filter-next-arrow"></p> 
        <div class="car-variant-filter-right">
        <div class="transmission-text">${transmissionText}</div>
        <div class="car-variant-transmission-filter">
          ${automaitcRadioHtml}
          ${manualRadioHtml}
        </div>
        </div>
       </div>
       <div class="card-list-teaser">
          <div class="slide-status">${carCountText}</div>
           <div class="card-list"></div>
          <!-- <div class="feature-text"><p>Prices/Schemes prevailing at the time of invoice /bill shall be applicable.<p></div> -->
           
           <div class="bottom-area">
            
            <div class="feature-text">${termsConditionLabel}</div>
           
            <div class="arrow-buttons">
              <button class="arrow left" disabled></button>
              <button class="arrow right"></button>
            </div>
           </div>
       </div>
   `;

    const variantFiltersContainer = newContainer.querySelector('.car-variant-filter-list');
    const carCardsContainer = newContainer.querySelector('.card-list');

    const transmissionFilter = newContainer.querySelector('.car-variant-transmission-filter');

    const filters = {};
    const filterTypes = [filterSelectedText];

    function createPrevNextFilterBtn() {
      const nextBtn = newContainer.querySelector('.filter-next-arrow');
      const prevBtn = newContainer.querySelector('.filter-prev-arrow');
      const switchListContainer = newContainer.querySelector('.variant-filter-cars .variant-filter-section .car-variant-filter-list');

      function nextSlide(event) {
        event.stopPropagation();
        switchListContainer.scrollBy({
          left: switchListContainer.clientWidth,
          behavior: 'smooth',
        });
        prevBtn.style.display = 'block';
        prevBtn.classList.remove('hidden');
        if (Math.round(switchListContainer.scrollLeft) + Math.round(switchListContainer.clientWidth) >= switchListContainer.scrollWidth - Math.round(switchListContainer.clientWidth)) {
          nextBtn.classList.add('hidden');
        } else {
          nextBtn.classList.remove('hidden');
        }
      }

      function prevSlide(event) {
        event.stopPropagation();
        switchListContainer.scrollBy({
          left: -switchListContainer.clientWidth,
          behavior: 'smooth',
        });
        nextBtn.classList.remove('hidden');
        if (Math.round(switchListContainer.scrollLeft) - Math.round(switchListContainer.clientWidth) <= 0) {
          prevBtn.classList.add('hidden');
        } else {
          prevBtn.classList.remove('hidden');
        }
      }

      function updateButtonVisibility() {
        // Show/hide previous button
        if (switchListContainer.scrollLeft > 0) {
          prevBtn.style.display = 'block';
        } else {
          prevBtn.style.display = 'none';
        }

        // Show/hide next button
        if (switchListContainer.clientWidth < switchListContainer.scrollWidth) {
          nextBtn.style.display = 'block';
        } else {
          nextBtn.style.display = 'none';
        }
      }

      if (isMobile) {
        prevBtn.style.display = 'none';
        // Add scroll event listener
        switchListContainer.addEventListener('scroll', updateButtonVisibility);
      } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }

      nextBtn?.addEventListener('click', (event) => nextSlide(event));
      prevBtn?.addEventListener('click', (event) => prevSlide(event));
    }

    createPrevNextFilterBtn();

    filterTypes.forEach((type) => {
      filters[type] = [];
    });

    const addOptionsToFilter = (filter, option) => {
      if (!filter.includes(option)) {
        filter.push(option);
      }
    };

    const initFilters = (car, type) => {
      const carType = car?.[type];
      if (!carType) return;
      if (Array.isArray(carType)) {
        carType.forEach((option) => {
          addOptionsToFilter(filters[type], option);
        });
      } else if (typeof carType === 'string') {
        addOptionsToFilter(filters[type], carType);
      }
    };

    cars.forEach((car) => {
      filterTypes.forEach((type) => {
        initFilters(car, type);
      });
    });

    Object.keys(filters).forEach((filterType) => {
      filters[filterType] = [...filters[filterType]];
    });

    const unifiedFilterOptions = [allFilterText, ...new Set(filterTypes.flatMap((type) => filters[type]))];
    selectedFilter = getFilterTypeFromHref(href.get('filter'), unifiedFilterOptions);
    function updateFilterStyles() {
      variantFiltersContainer.querySelectorAll('.variant-filter').forEach((filter) => {
        filter.classList.toggle('selected', filter.textContent === selectedFilter);
      });
    }

    function createCardElement(car) {
      const specData = car.specificationCategory.map((item) => {
        const fuelEfficiency = item.specificationAspect.find((aspect) => aspect.fuelEfficiency)?.fuelEfficiency;
        const seatingCapacity = item.specificationAspect.find((aspect) => aspect.seatingCapacity)?.seatingCapacity;
        const displacement = item.specificationAspect.find((aspect) => aspect.displacement)?.displacement;

        const obj = {};
        if (fuelEfficiency !== undefined) obj.fuelEfficiency = fuelEfficiency;
        if (seatingCapacity !== undefined) obj.seatingCapacity = seatingCapacity;
        if (displacement !== undefined) obj.displacement = displacement;

        return Object.keys(obj).length > 0 ? obj : null;
      })
        .filter((item) => item !== null);
      const featuresListHTML = car.featuresHighlights
        .map((featureItem) => `<span class="tooltip-container feature-list-container"><li class="feature-list-item tooltip-text">
        ${featureItem || ''}</li>
        <span class="tooltip top-end">${featureItem || ''}<svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
        <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/></svg>
        </span>`)
        .join('');

      const cardElement = document.createElement('div');
      cardElement.classList.add('card');

      cardElement.innerHTML = `
      <div class="card-inner">
        <span class="tooltip-container">
          <h3 class="card-title tooltip-text">${car.variantName}</h3>
          <span class="tooltip top-end">${car.variantName}
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
              <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
            </svg>
          </span>
        </span>
        <span class="tooltip-container">
          <p class="card-subtitle tooltip-text">${car.variantTechnology}</p>
          <span class="tooltip top-center">${car.variantTechnology}
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
              <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
          </svg>
        </span>
        </span>
        <div class="card-content">
          <div class="card-spec">
            <span class="tooltip-container">
              <p class="card-spec-val spec-displacement tooltip-text">${specData[0]?.displacement}</p>
              <span class="tooltip top-center">${specData[0]?.displacement}
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
                  <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
                </svg>
              </span>
            </span>
            <span class="tooltip-container">
              <p class="card-spec-label capacity-level tooltip-text">${labelsResult?.engineCapacityLabel ?? ''}</p>
              <span class="tooltip top-center">${labelsResult?.engineCapacityLabel ?? ''}
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
                    <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
                </svg>
              </span>
            </span>
            <p class="card-spec-val spec-transmission" data-transmission="${car.transmission}">
              ${car.transmission}
            </p>
            <p class="card-spec-label">
              ${labelsResult?.transmissionTypeLabel ?? ''}
            </p>
            <p class="card-spec-val spec-efficiency">
              ${specData[0]?.fuelEfficiency}
            </p>
            <p class="card-spec-label">
              ${labelsResult?.fuelEfficiencyLabel ?? ''}
            </p>
            <p class="card-price-text"></p>
            <p class="card-price" data-variant-id="${car.variantId}"></p>
          </div>
          <div class="card-image">
            <img src="${publishDomain + (car.variantImage?._dynamicUrl ?? '')}" alt="${car.altText || 'Car Image'}" loading="lazy">
          </div>
        </div>
        <div class="card-features">
          <div class="feature-list-title">${featuringText}</div>
          <ul class="feature-list">
            ${featuresListHTML}
          </ul>
          <div class="cta-btns">
            ${compareCta ? compareCta.outerHTML : ''}
            ${buildCta ? buildCta.outerHTML : ''}
          </div>
        </div>
        </div>
      `;

      return cardElement;
    }

    function updateCardPrice(cardElement, modelCode, car) {
      const priceTextElement = cardElement.querySelector('.card-price-text');
      const priceElement = cardElement.querySelector('.card-price');

      if (priceTextElement && priceElement) {
        fetchPrice(modelCode, car.variantCd, priceElement, priceTextElement);
      }
    }

    function fetchPriceInNumberFormat(cardElement) {
      return Number(cardElement.querySelector('.card-price').innerHTML.replace('₹', '').replaceAll(' ', ''));
    }

    function renderCards(carsToRender) {
      carCardsContainer.innerHTML = '';
      const cardElementsWithPrice = [];
      carsToRender.forEach((car) => {
        const cardElement = createCardElement(car);
        updateCardPrice(cardElement, localModelCode, car);
        cardElementsWithPrice.push(cardElement);
      });
      cardElementsWithPrice.sort((a, b) => (fetchPriceInNumberFormat(a) - fetchPriceInNumberFormat(b)));
      cardElementsWithPrice.forEach((cardElementWithPrice) => {
        carCardsContainer.appendChild(cardElementWithPrice);
      });
    }

    function matchesFilterType(car, type) {
      if (Array.isArray(car[type])) {
        return car[type].includes(selectedFilter);
      }
      if (typeof car[type] === 'string') {
        return car[type] === selectedFilter;
      }
      return false;
    }

    function carMatchesFilter(car) {
      if ((selectedFilter === allFilterText)) {
        return true;
      }
      return (filterTypes.some((type) => matchesFilterType(car, type)));
    }

    function selectNextAvailableRadioButton(radios) {
      for (const radio of radios) {
        if (!radio.disabled) {
          radio.checked = true;
          selectedRadio = radio.value;
          break;
        }
      }
    }

    function checkIfTrnsmissionForRadioExists(filteredCars, radio) {
      return filteredCars.filter((car) => car.transmission === radio.value).length === 0;
    }

    function manageTransmissionRadioButtons(filteredCars) {
      const radioButtons = transmissionFilter.querySelectorAll('input');

      radioButtons.forEach((radio) => {
        if (checkIfTrnsmissionForRadioExists(filteredCars, radio)) {
          radio.disabled = true;
        } else {
          radio.disabled = false;
        }
      });

      radioButtons.forEach((radio) => {
        if (!radio.disabled) {
          if (!selectedRadio) {
            radio.checked = true;
            selectedRadio = radio.value;
          }
        }
      });

      if (selectedRadio && document.querySelector(`input[value="${selectedRadio}"]:not(:disabled)`) === null) {
        selectNextAvailableRadioButton(radioButtons);
      }

      return filteredCars.filter((car) => car.transmission === selectedRadio);
    }

    function filterCards() {
      const filteredCars = cars.filter(carMatchesFilter);
      const filteredCarsBasedOnRadioBtn = manageTransmissionRadioButtons(filteredCars);
      renderCards(filteredCarsBasedOnRadioBtn);
    }

    transmissionFilter.addEventListener('change', (event) => {
      selectedRadio = event?.target?.value;
      const labels = transmissionFilter.querySelectorAll('label');
      labels.forEach((label) => label.classList.remove('selected'));
      if (event.target.checked) {
        const selectedLabel = event.target.closest('label');
        selectedLabel.classList.add('selected');
      }

      filterCards();
      const cards = carCardsContainer.querySelectorAll('.card-content');
      cards.forEach((card) => {
        const variantCard = card.querySelector('.spec-transmission');
        const dataTransmissionType = variantCard.getAttribute('data-transmission');
        if (dataTransmissionType === event.target.value) {
          card.closest('.card').style.display = '';
        } else {
          card.closest('.card').style.display = 'none';
        }
      });
    });

    function customSort(arr) {
      const noHyphen = arr.filter((item) => !item.includes('-'));
      const withHyphen = arr.filter((item) => item.includes('-'));
      noHyphen.sort();
      return noHyphen.concat(withHyphen);
    }

    customSort(unifiedFilterOptions).forEach((option) => {
      const filter = document.createElement('span');
      filter.classList.add('variant-filter');
      filter.textContent = option;
      filter.addEventListener('click', () => {
        selectedFilter = option;
        updateFilterStyles();
        filterCards();
      });
      variantFiltersContainer.appendChild(filter);
    });

    updateFilterStyles();
    filterCards();

    return newContainer;
  }

  function appendNewHTMLContainer() {
    if (newHTMLContainer) {
      block.innerHTML = '';
      if (id) {
        block.setAttribute('id', id);
      }
      block.appendChild(newHTMLContainer);
      newHTMLContainer = null;
      initCarousel({
        containerSelector: '.variant-filter-cars .card-list-teaser',
        cardListSelector: '.card-list',
        cardSelector: '.card',
        leftArrowSelector: '.arrow.left',
        rightArrowSelector: '.arrow.right',
        slideStatusSelector: '.slide-status',
        slidesPerViewConfig: {
          mobile: 1,
          tablet: 2,
          desktop: 3,
        },
      });
      utility.initializeTooltip(block, isMobile);
    }
  }

  async function fetchCars() {
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        newHTMLContainer = await carModelInfo(result);
        appendNewHTMLContainer();
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      });
  }

  fetchCars();

  function getIndexBasedOnCondition(carsArray, variantId) {
    let indexOfCar = 0;
    carsArray.forEach((car, index) => {
      if (car.variantId === variantId) {
        indexOfCar = index;
      }
    });
    return indexOfCar;
  }

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await initializeLocalStorage(apiUrl, forCode, localModelCode);
    const cardElements = Array.from(block.querySelectorAll('.card-content'));
    const fetchPricePromises = cardElements.map(async (el) => {
      const priceElement = el.querySelector('.card-price');
      if (priceElement) {
        const priceTextElement = el.querySelector('.card-price-text');
        const index = getIndexBasedOnCondition(cars, priceElement.dataset.variantId);
        const { variantCd } = cars[index];
        await fetchPrice(localModelCode, variantCd, priceElement, priceTextElement);
      }
    });
    await Promise.all(fetchPricePromises);
  });

  block.innerHTML = '';
  block.appendChild(newHTMLContainer);

  block.addEventListener('click', (e) => {
    if (!e.target?.classList?.contains('btn-primary') && !e.target?.classList?.contains('btn-secondary')) {
      return;
    }
    const data = {};
    const compTitle = e.target.closest('.card')?.querySelector('.card-title')?.textContent?.trim() || '';
    data.componentName = block.dataset.blockName;
    data.componentTitle = `${compTitle}` ? `Cards|${compTitle}` : '';
    data.componentType = 'button';
    data.webName = e.target?.textContent?.trim() || '';
    data.linkType = e.target;
    analytics.setButtonDetails(data);
  });
}
