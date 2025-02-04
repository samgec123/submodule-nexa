import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../utility/utility.js';

export default async function decorate(block) {
  const [
    titleEl,
    subtitleEl,
    priceTextEl,
    selectVariantEl,
    filterSelectEl,
    tabNameEl,
    tabIconEl,
    firstCardImgEl,
    firstCardAltEl,
    firstCardTitleEl,
    firstCardDescEl,
    firstCardLinkEl,
    secondCardImgEl,
    secondCardAltEl,
    secondCardTitleEl,
    secondCardDescEl,
    secondCardLinkEl
  ] = block.children;

  const {
    publishDomain, allFilterText, carTechnologyOrder, cfPrefix, apiExShowroomDetail: globalApiUrl,
  } = await fetchPlaceholders();

  let forCode = utility.getSelectedLocation()?.forCode ?? '08';
  const title = titleEl?.textContent?.trim();
  const subtitle = subtitleEl?.textContent?.trim();
  const priceText = priceTextEl?.textContent?.trim();
  const componentVariation = selectVariantEl?.textContent?.trim();
  const filterList = filterSelectEl?.textContent?.trim();
  const tabName = tabNameEl?.textContent?.trim() || '';
  const tabIcon = tabIconEl?.querySelector('img')?.src;
  const firstCardImg = firstCardImgEl?.querySelector('img')?.src;
  const firstCardAlt = firstCardAltEl?.textContent?.trim() || '';
  const firstCardTitle = firstCardTitleEl?.textContent?.trim() || '';
  const firstCardDesc = firstCardDescEl?.textContent?.trim() || '';
  const firstCardLink = firstCardLinkEl?.querySelector('a')?.href || '#';
  const secondCardImg = secondCardImgEl?.querySelector('img')?.src;
  const secondCardAlt = secondCardAltEl?.textContent?.trim() || '';
  const secondCardTitle = secondCardTitleEl?.textContent?.trim() || '';
  const secondCardDesc = secondCardDescEl?.textContent?.trim() || '';
  const secondCardLink = secondCardLinkEl?.querySelector('a')?.href || '#';

  const apiUrl = publishDomain + globalApiUrl;

  function getLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isKeyPresent(data, key) {
    const hasKey = (item) => Object.hasOwn(item.price, key);
    return Object.values(data).some(hasKey);
  }

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
          if (isKeyPresent(storageData, forCodeParam)) {
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
          const storedPrices = getLocalStorage('modelPrice') || {};
          Object.entries(initialModelPrices).forEach(([key, value]) => {
            storedPrices[key] = storedPrices[key] ? {
              ...storedPrices[key],
              price: { ...storedPrices[key].price, ...value.price },
              timestamp: value.timestamp,
            } : value;
          });
          setLocalStorage('modelPrice', storedPrices);
        }
      } catch (error) {
        throw new Error('Network response was not ok');
      }
    }
  }

  const storedPrices = getLocalStorage('modelPrice');
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
    const localStoredPrices = getLocalStorage('modelPrice') || {};
    const activeVariantList = await apiUtils.getActiveVariantList();

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
    url.searchParams.append("variantInfoRequired",true)
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
          const newPrice = lowestPrice.exShowroomPrice;
          //const newPrice = modelData.lowestExShowroomPrice;
          const timestamp = new Date().getTime() + (1 * 24 * 60 * 60 * 1000);
          let localStoredPrices = {
            ...getLocalStorage('modelPrice'),
            [modelCode]: {
              price: { [forCode]: newPrice },
              timestamp,
            },
          };
          console.log("from 1")
          setLocalStorage('modelPrice', localStoredPrices);

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
    const localStoredPrices = getLocalStorage('modelPrice') || {};
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
      card.classList.add('card');
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

  function carModelInfo(result) {
    cars = result.data.carModelList.items;
    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }
    cars = cars.sort((a, b) => a.headerCarOrder - b.headerCarOrder);

    const newContainer = document.createElement('div');
    newContainer.classList.add('filter-cars');

    const carFiltersContainer = document.createElement('div');
    carFiltersContainer.classList.add('car-filter-list');

    const carCardsContainer = document.createElement('div');
    carCardsContainer.classList.add('card-list');

    const carCardsWithTeaser = document.createElement('div');
    carCardsWithTeaser.classList.add('card-list-teaser');
    carCardsWithTeaser.append(carCardsContainer);
    newContainer.appendChild(carFiltersContainer);

    const textElement = document.createElement('div');
    textElement.classList.add('filter-text');
    newContainer.appendChild(textElement);

    const titleElement = document.createElement('div');
    titleElement.classList.add('title');
    titleElement.textContent = title;
    textElement.appendChild(titleElement);

    const subtitleElement = document.createElement('div');
    subtitleElement.classList.add('subtitle');
    subtitleElement.textContent = subtitle;
    textElement.appendChild(subtitleElement);

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
      if(option === tabName && tabIcon) {
          filter.innerHTML = utility.sanitizeHtml(`<img src="${tabIcon}" class="e-img">`) + filter.innerHTML;
      }
      filter.addEventListener('click', () => {
        selectedFilter = option;
        updateFilterStyles(carFiltersContainer);
        filterCards(carCardsContainer);
        if(option === tabName) {
            const card1 = document.createElement('a');
            card1.classList.add('card');
            card1.href = firstCardLink || '#';
            const cardImage1 = document.createElement('div');
            cardImage1.classList.add('card-image');
            const img1 = document.createElement('img');
            img1.src = firstCardImg;
            img1.alt = firstCardAlt;
            img1.loading = 'lazy';
            cardImage1.appendChild(img1);
            const cardContent1 = document.createElement('div');
            cardContent1.classList.add('card-content');
            const heading1 = document.createElement('h3');
            heading1.classList.add('card-title');
            heading1.textContent = firstCardTitle;
            cardContent1.appendChild(heading1);
            const description1 = document.createElement('p');
            description1.classList.add('card-price-text');
            description1.textContent = firstCardDesc;
            cardContent1.appendChild(description1);
            card1.appendChild(cardImage1);
            card1.appendChild(cardContent1);
            carCardsContainer.appendChild(card1);

            const card2 = document.createElement('a');
            card2.classList.add('card');
            card2.href = secondCardLink || '#';
            const cardImage2 = document.createElement('div');
            cardImage2.classList.add('card-image');
            const img2 = document.createElement('img');
            img2.src = secondCardImg;
            img2.alt = secondCardAlt;
            img2.loading = 'lazy';
            cardImage2.appendChild(img2);
            const cardContent2 = document.createElement('div');
            cardContent2.classList.add('card-content');
            const heading2 = document.createElement('h3');
            heading2.classList.add('card-title');
            heading2.textContent = secondCardTitle;
            cardContent2.appendChild(heading2);
            const description2 = document.createElement('p');
            description2.classList.add('card-price-text');
            description2.textContent = secondCardDesc;
            cardContent2.appendChild(description2);
            card2.appendChild(cardImage2);
            card2.appendChild(cardContent2);
            carCardsContainer.appendChild(card2);
        }
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
