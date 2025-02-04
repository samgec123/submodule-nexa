import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../utility/utility.js';
import '../../commons/scripts/splide/splide.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [
    titleEl,
    descriptionEl,
    priceTextEl,
    selectVariantEl,
    filterSelectEl,
  ] = block.children;

  const {
    publishDomain, allFilterText, carTechnologyOrder, cfPrefix, apiExShowroomDetail: globalApiUrl,
  } = await fetchPlaceholders();

  // Checks if the device screen is mobile or not
  const isXsDevice = window.matchMedia('(max-width: 1023px)').matches

  let forCode = utility.getSelectedLocation()?.forCode ?? '08';
  const title = titleEl?.textContent?.trim();
  const description = descriptionEl?.textContent?.trim();

  const priceText = priceTextEl?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const filterList = filterSelectEl?.textContent?.trim();

  const apiUrl = publishDomain + globalApiUrl;

  async function initializeLocalStorage(apiUrlParam, forCodeParam) {
    const activeVariantList = await apiUtils.getActiveVariantList();
    if (apiUrlParam) {
      const url = new URL(apiUrlParam);
      url.searchParams.append('forCode', forCodeParam);
      url.searchParams.append('channel', componentVariation === 'arena-variant' ? 'NRM' : 'EXC');
      url.searchParams.append('variantInfoRequired', true);
      try {
        const storedData = localStorage.getItem('modelPrice');
        if (storedData) {
          const storageData = JSON.parse(storedData);
          if (utility.isKeyPresent(storageData, forCodeParam)) {
            return;
          }
        }
        const response = await fetch(url.href);
        if (!response.ok) {
          return;
        }
        const data = await response.json();

        if (data.error === false && data.data) {
          const initialModelPrices = {};
          const timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);

          data?.data?.models.forEach((item) => {
            const { modelCd } = item;
            const variantList = activeVariantList.find(item => item.modelCd === modelCd) || null;
            const lowestPrice = utility.getLowestPriceVariant(variantList, item.exShowroomDetailResponseDTOList)

            initialModelPrices[modelCd] = {
              price: {
                [forCodeParam]: lowestPrice.exShowroomPrice,
              },
              timestamp,
            };
          });

          const storedPrices = utility.getLocalStorage('modelPrice') || {};
          Object.entries(initialModelPrices).forEach(([key, value]) => {
            storedPrices[key] = storedPrices[key] ? {
              ...storedPrices[key],
              price: { ...storedPrices[key].price, ...value.price },
              timestamp: value.timestamp,
            } : value;
          });
          utility.setLocalStorage('modelPrice', storedPrices);
        }
      } catch (error) {
        throw new Error('Network response was not ok');
      }
    }
  }

  const storedPrices = utility.getLocalStorage('modelPrice');
  if (!storedPrices) {
    await initializeLocalStorage(apiUrl, forCode);
  }

  function priceFormatting(price) {
    if (componentVariation === 'arena-variant') {
      return utility.formatToLakhs(price);
    }
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    });

    return `${formatter.format(price).replaceAll(',', ' ')}`;
  }

  async function fetchAndUpdatePrice(modelCode, priceElement, priceTextElement) {
    const localStoredPrices = utility.getLocalStorage('modelPrice') || {};
    const modelPrices = localStoredPrices[modelCode] || {};
    const storedPrice = modelPrices.price[forCode];
    const expiryTimestamp = modelPrices.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
      return;
    }

    const params = { forCode, channel: componentVariation === 'arena-variant' ? 'NRM' : 'EXC' };
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    url.searchParams.append("variantInfoRequired", true)
    try {
      const response = await fetch(url.href);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (data.error === false && data.data) {
        const modelData = data.data.models.find((item) => item.modelCd === modelCode);
        const variantList = activeVariantList.find(item => item.modelCd === modelCode) || null;
        const lowestPrice = utility.getLowestPriceVariant(variantList, modelData.exShowroomDetailResponseDTOList)
        if (modelData) {
          //const newPrice = modelData.lowestExShowroomPrice;
          const newPrice = lowestPrice.exShowroomPrice;
          const timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);
          let localStoredPrices = {
            ...getLocalStorage('modelPrice'),
            [modelCode]: {
              price: { [forCode]: newPrice },
              timestamp,
            },
          };
          console.log("from 5")
          utility.setLocalStorage('modelPrice', localStoredPrices);

          priceTextElement.textContent = priceText;
          priceElement.textContent = priceFormatting(newPrice);
        } else {
          priceElement.style.display = 'none';
        }
      } else {
        priceElement.style.display = 'none';
      }
    } catch (error) {
      priceElement.style.display = 'none';
      throw new Error('Network response was not ok');
    }
  }

  async function fetchPrice(modelCode, priceElement, priceTextElement) {
    const localStoredPrices = utility.getLocalStorage('modelPrice') || {};
    const modelData = localStoredPrices[modelCode] || {};
    if (!modelData.price) {
      return;
    }
    const storedPrice = modelData?.price[forCode];
    const expiryTimestamp = modelData.timestamp;
    const currentTimestamp = new Date().getTime();

    if (storedPrice && currentTimestamp <= expiryTimestamp) {
      priceTextElement.textContent = priceText;
      priceElement.textContent = priceFormatting(storedPrice);
    } else {
      await fetchAndUpdatePrice(modelCode, priceElement, priceTextElement);
    }
  }

  let cars = [];
  let selectedFilter = allFilterText;
  const filters = {};
  const filterTypes = filterList.split(',');

  filterTypes.forEach((type) => {
    filters[type] = new Set();
  });

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
    if (selectedFilter === allFilterText) return true;
    return filterTypes.some((type) => matchesFilterType(car, type));
  }

  function updateFilterStyles(container) {
    container.querySelectorAll('.filter').forEach((filter) => {
      filter.classList.toggle('selected', filter.textContent === selectedFilter);
    });
  }

  function renderCards(container, carsToRender) {
    container.innerHTML = '';

    carsToRender.forEach((car, index) => {
      const card = document.createElement('a');
      card.classList.add('card', 'splide__slide');
      // eslint-disable-next-line no-underscore-dangle
      const carDetailPath = car.carDetailsPagePath?._path || '#';
      card.href = carDetailPath.replace(cfPrefix, '');

      if (componentVariation === 'arena-variant') {
        const cardLogoImage = document.createElement('div');
        cardLogoImage.classList.add('card-logo-image');

        const logoImg = document.createElement('img');
        // eslint-disable-next-line no-underscore-dangle
        logoImg.src = car.carLogoImage?._dmS7Url;
        logoImg.alt = car.logoImageAltText;
        cardLogoImage.appendChild(logoImg);
        card.appendChild(cardLogoImage);
      }

      const cardImage = document.createElement('div');
      cardImage.classList.add('card-image');

      const img = document.createElement('img');
      // eslint-disable-next-line no-underscore-dangle
      img.src = publishDomain + (car.carImage?._dynamicUrl ?? '');
      img.alt = car.altText;
      img.loading = 'lazy';
      cardImage.appendChild(img);

      const cardContent = document.createElement('div');
      cardContent.classList.add('card-content');

      const heading = document.createElement('h3');
      heading.classList.add('card-title');
      heading.textContent = car.modelDesc;
      cardContent.appendChild(heading);

      const priceTextElement = document.createElement('p');
      priceTextElement.classList.add('card-price-text');
      cardContent.appendChild(priceTextElement);

      const priceElement = document.createElement('p');
      priceElement.classList.add('card-price');
      priceElement.dataset.targetIndex = index;
      cardContent.appendChild(priceElement);

      fetchPrice(car.modelCd, priceElement, priceTextElement);

      card.appendChild(cardImage);
      card.appendChild(cardContent);

      container.appendChild(card);

      const getClickDetails = () => {
        const pageDetails = {};
        pageDetails.componentName = 'Tile';
        pageDetails.componentTitle = title;
        pageDetails.componentType = 'link';
        pageDetails.webName = heading?.innerText || '';
        pageDetails.linkType = "other";

        analytics.setButtonDetails(pageDetails);
      };

      card.addEventListener('click', () => {
        getClickDetails()
      });
    });
  }

  function filterCards(carCardsContainer) {
    const filteredCars = cars.filter(carMatchesFilter);
    renderCards(carCardsContainer, filteredCars);
  }

  function resetFilters() {
    selectedFilter = allFilterText;
    updateFilterStyles(block.querySelector('.car-filter-list'));
    filterCards(block.querySelector('.card-list'));
  }

  function initCarousel() {
    if (isXsDevice) {
      return;
    }

    new Splide('.splide-carousel', {
      perPage: 4,
      perMove: 1,
      gap: '24px',
      pagination: false,
      mediaQuery: 'min',
      breakpoints: {
        1920: {
          perPage: 6,
        },
      }
    }).mount();
  }

  function carModelInfo(result) {
    cars = result.data.carModelList.items;

    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    const newContainer = document.createElement('div');
    newContainer.classList.add('filter-cars');

    const carFiltersContainer = document.createElement('div');
    carFiltersContainer.classList.add('car-filter-list');

    const carCardsWithTeaser = document.createElement('div');
    carCardsWithTeaser.classList.add('card-list-teaser', 'splide-carousel');

    if (!isXsDevice) {
      carCardsWithTeaser.classList.add('splide');
    }

    const carCardsTrack = document.createElement('div');
    carCardsTrack.classList.add('splide__track');

    const carCardsContainer = document.createElement('div');
    carCardsContainer.classList.add('card-list', 'splide__list');
    carCardsTrack.append(carCardsContainer);
    carCardsWithTeaser.append(carCardsTrack);

    const carouselArrows = document.createElement('div');
    carouselArrows.classList.add('splide__arrows');
    const prevButton = document.createElement('button');
    prevButton.classList.add('splide__arrow', 'splide__arrow--prev');
    const nextButton = document.createElement('button');
    nextButton.classList.add('splide__arrow', 'splide__arrow--next');

    carouselArrows.append(prevButton);
    carouselArrows.append(nextButton);
    carCardsWithTeaser.append(carouselArrows);

    const textElement = document.createElement('div');
    textElement.classList.add('filter-text');
    newContainer.appendChild(textElement);

    const titleElement = document.createElement('div');
    titleElement.classList.add('title');
    titleElement.textContent = title;
    textElement.appendChild(titleElement);

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('description');
    descriptionElement.textContent = description;
    textElement.appendChild(descriptionElement);

    newContainer.appendChild(carFiltersContainer);

    newContainer.append(carCardsWithTeaser);

    const addOptionsToFilter = (filter, options) => {
      if (typeof options === 'string') {
        filter.add(options);
      } else if (Array.isArray(options)) {
        options.forEach((opt) => {
          if (typeof opt === 'string') {
            filter.add(opt);
          }
        });
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

    function customSort(arr) {
      if (carTechnologyOrder) {
        const customOrder = carTechnologyOrder.split(',');
        const orderMap = {};
        customOrder.forEach((item, index) => {
          orderMap[item] = index;
        });
        arr.sort((a, b) => {
          const aIndex = orderMap[a] !== undefined ? orderMap[a] : Infinity; // Use Infinity for items not in the custom order
          const bIndex = orderMap[b] !== undefined ? orderMap[b] : Infinity;
          return aIndex - bIndex;
        });
        return arr;
      }
      return arr.sort();
    }

    Object.keys(filters).forEach((filterType) => {
      filters[filterType] = customSort([...filters[filterType]]);
    });

    let unifiedFilterOptions;

    if (componentVariation === 'arena-variant') {
      unifiedFilterOptions = [...new Set(filterTypes.flatMap((type) => filters[type]))];
    } else {
      unifiedFilterOptions = [allFilterText,
        ...new Set(filterTypes.flatMap((type) => filters[type]))];
    }

    unifiedFilterOptions.forEach((option, index) => {
      const filter = document.createElement('span');
      filter.classList.add('filter');
      filter.textContent = option;
      if (index === 0) {
        filter.classList.add('selected');
        selectedFilter = option;
      }
      filter.addEventListener('click', () => {
        selectedFilter = option;
        updateFilterStyles(carFiltersContainer);
        filterCards(carCardsContainer);

        initCarousel();
      });
      carFiltersContainer.appendChild(filter);
    });

    updateFilterStyles(carFiltersContainer);
    filterCards(carCardsContainer);

    return newContainer;
  }

  const graphQlEndpoint = componentVariation === 'arena-variant'
    ? `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList`
    : `${publishDomain}/graphql/execute.json/msil-platform/NexaCarList`;

  let newHTMLContainer = document.createElement('div');

  function appendNewHTMLContainer() {
    if (newHTMLContainer) {
      block.classList.add('separator', 'separator-grey', 'separator-sm');
      block.innerHTML = '';
      block.appendChild(newHTMLContainer);
      newHTMLContainer = null;
    }
  }

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  function fetchCars() {
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        newHTMLContainer = carModelInfo(result);
        appendNewHTMLContainer();
        initCarousel();
      })
      .catch((error) => {
        throw new Error('Network response was not ok', error);
      });
  }

  fetchCars();

  document.addEventListener('updateLocation', async (event) => {
    forCode = event?.detail?.message;
    await initializeLocalStorage(apiUrl, forCode);

    const cardElements = Array.from(block.querySelectorAll('.card-content')); // Convert NodeList to Array
    const fetchPricePromises = cardElements.map(async (el) => {
      const priceElement = el.querySelector('.card-price');
      if (priceElement) {
        const priceTextElement = el.querySelector('.card-price-text');
        const index = parseInt(priceElement.dataset.targetIndex, 10);
        const { modelCd } = cars[index];
        await fetchPrice(modelCd, priceElement, priceTextElement);
      }
    });

    await Promise.all(fetchPricePromises);
  });

  block.innerHTML = '';
  block.appendChild(newHTMLContainer);

  block.addEventListener('mouseleave', () => {
    const style = window.getComputedStyle(block.parentElement);
    const display = style.getPropertyValue('display');

    if (display === 'none') {
      resetFilters();
    }
  });

  function updateCardListMaxWidth() {
    // Select elements
    const cardList = block.querySelector('.card-list');
    const teaserList = block.querySelector('.teaser-list');
    const filterText = block.querySelector('.filter-text');
    const carFilterList = block.querySelector('.car-filter-list');

    const teaserListHeight = teaserList ? teaserList.offsetHeight : 0;
    const filterTextHeight = filterText ? filterText.offsetHeight : 0;
    const carFilterListHeight = carFilterList ? carFilterList.offsetHeight : 0;

    const viewportHeight = window.innerHeight;
    const totalHeight = teaserListHeight + filterTextHeight + carFilterListHeight + 132; // extra padding and header height 132

    const maxHeight = Math.max(viewportHeight - totalHeight, 0);

    if (cardList) {
      cardList.style.maxHeight = `${maxHeight}px`;
    }
  }

  updateCardListMaxWidth();
  const isMobile = window.matchMedia('(width < 768px)').matches;

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
}
