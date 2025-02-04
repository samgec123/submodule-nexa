import {
  fetchPlaceholders,
} from '../../commons/scripts/aem.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';
import initCarousel from './variantUtil.js';
import ctaUtils from '../../utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    idEl,
    titleEl,
    subtitleEl,
    exshowroomPrefixEl,
    selectVariantEl,
    filterSelectEl,
    compareCtaTextEl,
    compareCtaLinkEl,
    compareCtaTargetEl,
    buildCtaTextEl,
    buildCtaLinkEl,
    buildCtaTargetEl,
    carCountTextEl,
    featuringLabelEl,
  ] = children;

  const {
    publishDomain,
    allFilterText,
  } = await fetchPlaceholders();

  let forCode = utility.getSelectedLocation()?.forCode ?? '08';
  const localModelCode = 'VE';
  const id = idEl?.textContent?.trim() || null;
  const title = titleEl?.textContent?.trim();
  const subtitle = subtitleEl?.textContent?.trim();
  const priceText = exshowroomPrefixEl?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const filterSelectedText = filterSelectEl?.textContent?.trim() || 'variantTechnology';
  const buildCta = ctaUtils.getLink(buildCtaLinkEl, buildCtaTextEl, buildCtaTargetEl, 'btn-primary');
  const carCountText = carCountTextEl?.textContent?.trim() || '';
  const featuringText = featuringLabelEl?.textContent?.trim() || '';
  const isMobile = window.matchMedia('(width < 768px)').matches;
  let selectedFilter;

  const apiUrl = new URL(publishDomain);
  apiUrl.searchParams.append('variantInfoRequired', 'true');

  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/VariantFeaturesList;modelCd=${localModelCode};locale=en`;
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

  // async function initializeLocalStorage(apiUrlParam, forCodeParam, modelCodeParam) { // Renamed to avoid shadowing
  //   const url = new URL(apiUrlParam);
  //   url.searchParams.append('forCode', forCodeParam);
  //   url.searchParams.append('channel', componentVariation === 'arena-variant' ? 'NRM' : 'EXC');
  //   url.searchParams.append('modelCodes', modelCodeParam);

  //   try {
  //     const storedData = localStorage.getItem('variantsPrice');
  //     const storageData = storedData ? JSON.parse(storedData) : {};

  //     if (storageData[modelCodeParam]?.variants) {
  //       const {
  //         variants,
  //       } = storageData[modelCodeParam];
  //       const priceKeyExists = Object.values(variants).some((variant) => variant.price && variant.price[forCodeParam] !== undefined);
  //       if (priceKeyExists) {
  //         return;
  //       }
  //     }

  //     const response = await fetch(url.href, {
  //       method: 'GET',
  //     });
  //     if (!response.ok) {
  //       return;
  //     }
  //     const data = await response.json();

  //     if (data.error === false && data.data) {
  //       const variants = data.data.models[0].exShowroomDetailResponseDTOList;

  //       const initialVariantPrices = {};

  //       variants.forEach((item) => {
  //         const {
  //           variantCd,
  //           exShowroomPrice,
  //         } = item;
  //         initialVariantPrices[variantCd] = {
  //           price: {
  //             [forCodeParam]: exShowroomPrice,
  //           },
  //           timestamp: new Date().getTime() + (1 * 24 * 60 * 60 * 1000),
  //         };
  //       });

  //       if (!storageData[modelCodeParam]) {
  //         storageData[modelCodeParam] = {
  //           modelCd: modelCodeParam,
  //           variants: initialVariantPrices,
  //         };
  //       } else {
  //         Object.keys(initialVariantPrices).forEach((variantCd) => {
  //           const existingVariant = storageData[modelCodeParam].variants[variantCd] || {};
  //           existingVariant.price[forCodeParam] = initialVariantPrices[variantCd].price[forCodeParam];
  //           existingVariant.timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);
  //           storageData[modelCodeParam].variants[variantCd] = existingVariant;
  //         });
  //       }
  //       setLocalStorage('variantsPrice', storageData);
  //     }
  //   } catch (error) {
  //     console.error('Fetch error:', error);
  //   }
  // }

  const storedPrices = getLocalStorage('variantsPrice');
  // if (!storedPrices) {
  //   await initializeLocalStorage(apiUrl, forCode, localModelCode);
  // }

  // if (storedPrices) {
  //   if (storedPrices[localModelCode]) {
  //     const {
  //       variants,
  //     } = storedPrices[localModelCode];
  //     const priceKeyExists = Object.values(variants).some((variant) => variant.price && variant.price[forCode] !== undefined);
  //     if (!priceKeyExists) {
  //       await initializeLocalStorage(apiUrl, forCode, localModelCode);
  //     }
  //   } else {
  //     await initializeLocalStorage(apiUrl, forCode, localModelCode);
  //   }
  // }

  // function priceFormatting(price) {
  //   if (componentVariation === 'arena-variant') {
  //     return utility.formatToLakhs(price);
  //   }
  //   const formatter = new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //     maximumFractionDigits: 0,
  //   });
  //   return formatter.format(price)?.replaceAll(',', ' ');
  // }

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

  async function carModelInfo(result) {
    cars = result.data.carModelList.items[0].variants;
    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    const labelsResult = (await apiUtils.getCarLabelsList())[0];
    const newContainer = document.createElement('div');
    newContainer.classList.add('variant-filter-cars');

    newContainer.innerHTML = utility.sanitizeHtml(`
       <div class="variant-filter-text">
           <h2 class="title">${title}</h2>
           <div class="subtitle">${subtitle}</div>
       </div>
       <div class="card-list-teaser">
          <div class="slide-status">${carCountText}</div>
           <div class="card-list"></div>
           <div class="arrow-buttons">
            <button class="arrow left" disabled></button>
            <button class="arrow right"></button>
           </div>
       </div>
    `);

    const carCardsContainer = newContainer.querySelector('.card-list');

    const filters = {};
    const filterTypes = [filterSelectedText];

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

    function createCardElement(car) {
      const specData = car.specificationCategory.map((item) => {
        const batteryCapacity = item.specificationAspect.find((aspect) => aspect.batteryCapacity)?.batteryCapacity;
        const topSpeed = item.specificationAspect.find((aspect) => aspect.topSpeed)?.topSpeed;
        const acceleration = item.specificationAspect.find((aspect) => aspect.acceleration)?.acceleration;

        const obj = {};
        if (batteryCapacity !== undefined) obj.batteryCapacity = batteryCapacity;
        if (topSpeed !== undefined) obj.topSpeed = topSpeed;
        if (acceleration !== undefined) obj.acceleration = acceleration;

        return Object.keys(obj).length > 0 ? obj : null;
      })
        .filter((item) => item !== null);
      const featuresListHTML = car.carFeatures
        .map((featureItem) => `<span class="tooltip-container feature-list-container"><li class="feature-list-item tooltip-text">
        ${featureItem?.feature?.title || 'Baleno'}</li>
        <span class="tooltip top-end">${featureItem?.feature?.title || 'Baleno'}<svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
        <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/></svg>
        </span>`)
        .join('');

      const cardElement = document.createElement('div');
      cardElement.classList.add('card');

      cardElement.innerHTML = utility.sanitizeHtml(`
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
              <p class="card-spec-val spec-battery-capacity tooltip-text">${specData[0].batteryCapacity}</p>
              <span class="tooltip top-center">${specData[0].batteryCapacity}
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
                  <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
                </svg>
              </span>
            </span>
            <span class="tooltip-container">
              <p class="card-spec-label capacity-level tooltip-text">${labelsResult?.batteryCapacityLabel ?? ''}</p>
              <span class="tooltip top-center">${labelsResult?.batteryCapacityLabel ?? ''}
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
                    <path d="M9.5 17L1.48619e-06 -1.66103e-06L19 0L9.5 17Z" fill="#515151"/>
                </svg>
              </span>
            </span>
            <p class="card-spec-val spec-top-speed">
              ${specData[0].topSpeed}
            </p>
            <p class="card-spec-label">
              ${labelsResult?.topSpeedLabel ?? ''}
            </p>
            <p class="card-spec-val spec-acceleration">
              ${specData[0].acceleration}
            </p>
            <p class="card-spec-label">
              ${labelsResult?.accelerationLabel ?? ''}
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
            ${buildCta ? buildCta.outerHTML : ''}
          </div>
        </div>
      `);

      return cardElement;
    }

    function updateCardPrice(cardElement, modelCode, car) {
      const priceTextElement = cardElement.querySelector('.card-price-text');
      const priceElement = cardElement.querySelector('.card-price');

      if (priceTextElement && priceElement) {
        fetchPrice(modelCode, car.variantCd, priceElement, priceTextElement);
      }
    }

    function renderCards(carsToRender) {
      carCardsContainer.innerHTML = '';

      carsToRender.forEach((car) => {
        const cardElement = createCardElement(car);
        carCardsContainer.appendChild(cardElement);
        updateCardPrice(cardElement, localModelCode, car);
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


    renderCards(cars);

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

  function updateCardListMaxWidth() {
    const cardList = block.querySelector('.card-list');
    const teaserList = block.querySelector('.teaser-list');
    const filterText = block.querySelector('.variant-filter-text');

    const teaserListHeight = teaserList ? teaserList.offsetHeight : 0;
    const filterTextHeight = filterText ? filterText.offsetHeight : 0;

    const viewportHeight = window.innerHeight;
    const totalHeight = teaserListHeight + filterTextHeight + 132;

    const maxHeight = Math.max(viewportHeight - totalHeight, 0);

    if (cardList) {
      cardList.style.maxHeight = `${maxHeight}px`;
    }
  }

  updateCardListMaxWidth();
  window.addEventListener('resize', () => {
    if (isMobile) {
      updateCardListMaxWidth();
    }
  });

  document.addEventListener('carIconClick', (event) => {
    if (event && isMobile) {
      setTimeout(() => {
        updateCardListMaxWidth();
      }, 100);
    }
  });

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

  if (isMobile) {
    const cardListTeaser = newContainer.querySelector('.card-list-teaser');
    const cardList = cardListTeaser.querySelector('.card-list');
    const leftArrow = cardListTeaser.querySelector('.arrow.left');
    const rightArrow = cardListTeaser.querySelector('.arrow.right');

    let scrollPosition = 0;

    const updateArrowState = () => {
        leftArrow.disabled = scrollPosition <= 0;
        rightArrow.disabled = scrollPosition >= cardList.scrollWidth - cardList.offsetWidth;
    };

    leftArrow.addEventListener('click', () => {
        scrollPosition -= cardList.offsetWidth;
        if (scrollPosition < 0) scrollPosition = 0;
        cardList.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        updateArrowState();
    });

    rightArrow.addEventListener('click', () => {
        scrollPosition += cardList.offsetWidth;
        if (scrollPosition > cardList.scrollWidth - cardList.offsetWidth) {
            scrollPosition = cardList.scrollWidth - cardList.offsetWidth;
        }
        cardList.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        updateArrowState();
    });

    updateArrowState();
}

}
