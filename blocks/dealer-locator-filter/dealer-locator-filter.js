import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import ctaUtils from '../../utility/ctaUtils.js';
import apiUtils from '../../utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const currentUrl = new URL(window.location.href); // Get the current URL
  const lastFlow = currentUrl.searchParams.get('lastFlow') || ''; // Get 'isDealerFlow'
  const dealerId = currentUrl.searchParams.get('dealerId') || '';
  if(dealerId !== '') {
   var section = document.querySelector('.dealer-locator-filter-container');
    setTimeout(() => {
      section.scrollIntoView({
        behavior: 'smooth',   // Optional: Adds smooth scrolling
        block: 'start'        // Optional: Scroll to the top of the element
      });
    },0)
  }
  let isPageLoad = false;
  if (lastFlow === '') {
    sessionStorage.removeItem('isBtdFlowStep');
    sessionStorage.removeItem('payLoadBtd');
    sessionStorage.removeItem('isBsvFlowStep');
    sessionStorage.removeItem('payLoadSrv');
    sessionStorage.removeItem('slectedDelerIndex');
  }
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
  } = await fetchPlaceholders();
  const [
    pincodeTextEl,
    pincodeValueEl,
    incorrectPincodeMsgEl,
    cityTextEl,
    ,
    ,
    ,
    , ,
    visitingTextEl,
    dsValueEl,
    scValueEl,
    trueValueEl,
    showcasingTextEl,
    carModelTextEl,
    carVariantTextEl,
    colourTextEl,
    radiusTextEl,
    radiusValueEl,
    distanceTextEl,
    viewTypeEl,
    completeJourneyTextEl,
    completeCtaTextEl,
    directionCtaTextEl,
    directionCtaLinkEl,
    directionCtaTargetEl,
    navigateCtaTextEl,
    navigateCtaLinkEl,
    navigateCtaTargetEl,
    ctaTextEl,
    ctaLinkEL,
    cardViewLinkEL,
    cardHeadingEl,
    mapHeadingEl,
    scheduleVisitTextEl,
    scheduleVisitLinkEl,
    scheduleVisitTargetEl,
    scheduleTestDriveTextEl,
    scheduleTestDriveLinkEl,
    scheduleTestDriveTargetEl,
    clipboardSuccessMsgEl,
    locationMarkerIconEl,
    requestQuoteTextEl,
    requestQuoteLinkEl,
    requestQuoteTargetEl,
    bookNowTextEl,
    bookNowLinkEl,
    bookNowTargetEl,
    dreamCarTitleEl,
  ] = block.children;
  const incorrectPincodeMsg = incorrectPincodeMsgEl?.textContent?.trim();
  const pincodeText = pincodeTextEl?.textContent?.trim();
  const clipboardSuccessMsg = clipboardSuccessMsgEl?.textContent?.trim();
  const pincodeValue = pincodeValueEl?.textContent?.trim();
  const cityText = cityTextEl?.textContent?.trim();
  const visitingText = visitingTextEl?.textContent?.trim();
  const dsValue = dsValueEl?.textContent?.trim();
  const scValue = scValueEl?.textContent?.trim();
  const trueValue = trueValueEl?.textContent?.trim();
  const showcasingText = showcasingTextEl?.textContent?.trim();
  const carModelText = carModelTextEl?.textContent?.trim();
  const carVariantText = carVariantTextEl?.textContent?.trim();
  const colourText = colourTextEl?.textContent?.trim();
  const radiusText = radiusTextEl?.textContent?.trim();
  const radiusValueList = radiusValueEl?.textContent?.trim();
  const radiusValue = radiusValueList.split(',');
  const distanceText = distanceTextEl?.textContent?.trim();
  const viewType = viewTypeEl?.textContent?.trim();
  const completeJourneyText = completeJourneyTextEl?.textContent?.trim();
  const completeCtaText = completeCtaTextEl?.textContent?.trim();
  const ctaText = ctaTextEl?.textContent?.trim();
  const ctaLink = ctaLinkEL?.querySelector('a')?.getAttribute('href');
  const cardViewLink = cardViewLinkEL?.querySelector('a')?.getAttribute('href');
  const cardHeading = cardHeadingEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  cardHeading?.classList?.add('card-view__heading');
  const dreamCarHeading = dreamCarTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  dreamCarHeading?.classList?.add('book-my-car__heading');
  const mapHeading = mapHeadingEl?.querySelector(':is(h1,h2,h3,h4,h5,h6,p)');
  const locationMarkerIconSrc = locationMarkerIconEl?.querySelector('img')?.src || '';
  const carModelCode = currentUrl.searchParams.get('modelCd') || '';
  const forCode = utility.getSelectedLocation()?.forCode || defaultForCode;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const primaryDirectionCta = ctaUtils.getLink(
    directionCtaLinkEl,
    directionCtaTextEl,
    directionCtaTargetEl,
  );

  const secondaryNavigateCta = ctaUtils.getLink(
    navigateCtaLinkEl,
    navigateCtaTextEl,
    navigateCtaTargetEl,
  );

  const scheduleVisitBtn = ctaUtils.getLink(
    scheduleVisitLinkEl,
    scheduleVisitTextEl,
    scheduleVisitTargetEl,
  );

  const scheduleTestBtn = ctaUtils.getLink(
    scheduleTestDriveLinkEl,
    scheduleTestDriveTextEl,
    scheduleTestDriveTargetEl,
  );
  const requestQuoteBtn = ctaUtils.getLink(
    requestQuoteLinkEl,
    requestQuoteTextEl,
    requestQuoteTargetEl,
  );

  const bookNowBtn = ctaUtils.getLink(
    bookNowLinkEl,
    bookNowTextEl,
    bookNowTargetEl,
  );

  const navigateLinkPlaceholder = navigateCtaLinkEl?.querySelector('a')?.href;
  const directionLinkPlaceholder = directionCtaLinkEl?.querySelector('a')?.href;

  let initMapView = true;
  let isBookDreamCar = false;

  const scheduleTestDriveLink = scheduleTestDriveLinkEl?.querySelector('a');
  const scheduleVisitLink = scheduleVisitLinkEl?.querySelector('a');
  const createscheduleVisitLink = (index) => {
    if (scheduleVisitLink) {
      const scheduleVisitButton = document.createElement('div');
      scheduleVisitButton.className = 'visit-cta scheduleVisitButton';
      scheduleVisitButton.setAttribute('dealarIndex', index);
      scheduleVisitButton.setAttribute('redirectUrl', scheduleVisitLink.getAttribute('href'));
      scheduleVisitButton.innerHTML = scheduleVisitBtn.outerHTML;
      return scheduleVisitButton.outerHTML;
    }
    return '';
  };

  const createScheduleTestDriveLink = (index) => {
    if (scheduleTestDriveLink) {
      const scheduleTestDriveButton = document.createElement('div');
      scheduleTestDriveButton.className = 'test-cta sheduleTestDriveButton';
      scheduleTestDriveButton.setAttribute('dealarIndex', index);
      scheduleTestDriveButton.setAttribute('redirectUrl', scheduleTestDriveLink.getAttribute('href'));
      scheduleTestDriveButton.innerHTML = scheduleTestBtn.outerHTML;
      return scheduleTestDriveButton.outerHTML;
    }
    return '';
  };

  function isVisible(ele) {
    const { top, bottom } = ele.getBoundingClientRect();
    const vHeight = window.innerHeight || document.documentElement.clientHeight;
    return (top > 0 || bottom > 0) && top < vHeight;
  }

  function handleScroll() {
    if (isVisible(block)) {
      window.removeEventListener('scroll', handleScroll);
    }
  }

  window.addEventListener('scroll', handleScroll);

  function addExploreLessToAllSelectItems() {
    const exploreLessDiv = document.createElement('div');
    exploreLessDiv.className = 'explore-less';

    document.querySelectorAll('.select-items').forEach((selectItemsDiv) => {
      if (!selectItemsDiv.querySelector('.explore-less')) {
        selectItemsDiv.appendChild(exploreLessDiv.cloneNode(true));
      }
    });

    document.querySelectorAll('.explore-less').forEach((exploreLess) => {
      exploreLess.addEventListener('click', (event) => {
        const { target } = event;
        if (
          target.matches('.explore-less')
          || target.matches('.explore-less::after')
        ) {
          const selectItemsDiv = target.closest('.select-items');
          if (selectItemsDiv) {
            selectItemsDiv.classList.add('select-hide');
            selectItemsDiv.classList.remove('select-show');
          }
        }
      });
    });
  }

  function capitalizeFirstLetter(string) {
    if (string == null || string === '' || string.trim().toLowerCase() === 'null') { 
      // Check for null, undefined, empty string, or "null" as a string (case-insensitive)
      return '';
    }
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  let initDefaultCityDataLayer = false;
  let initFormDataLayerEvent = false;
  const sendEnquiryStartEvent = (e) => {
    if (!initFormDataLayerEvent && initDefaultCityDataLayer) {
      const details = {};
      details.formName = 'Dealer Locator';
      details.webName = e.target.name || e.target.closest('custom-select')?.getAttribute('name');
      details.linkType = 'other';
      analytics.setEnquiryStartDetails(details);
      initFormDataLayerEvent = true;
    }
  };
  function initVariantsAndColorsDataLayer() {
    const form = block.querySelector('.filter-container');
    form.querySelectorAll('#colours .custom-option, #carVariant .custom-option').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
  }
  function initFormDataLayer() {
    const form = block.querySelector('.filter-container');
    form.querySelectorAll('input').forEach((field) => {
      field.addEventListener('focus', sendEnquiryStartEvent);
      field.addEventListener('change', sendEnquiryStartEvent);
    });
    form.querySelectorAll('#city .custom-option, #visiting .custom-option, #showcasing .custom-option, #radius .custom-option').forEach((field) => {
      field.addEventListener('click', sendEnquiryStartEvent);
    });
  }

  function isComponentVisibleInDom(component) {
    const computedStyle = window.getComputedStyle(component);
    if (computedStyle.display === 'none') {
      return false;
    }
    return true;
  }

  async function getNearestDealers(latitude, longitude, distance, dealer, options = {}, onSuccess = () => { }) {
    const { modelCode, variantCode, colorCd } = options;
    try {
      // Define the function to make the API call and filter by 'EXC' channel
      const fetchDealers = async (lat, long, dist, dealerType) => {
        const query = new URLSearchParams({
          latitude: lat,
          longitude: long,
          distance: dist * 1000,
          dealerType,
        });
        if (modelCode) query.append('modelCode', modelCode);
        if (variantCode && isBookDreamCar) query.append('variantCode', variantCode);
        if (colorCd && isBookDreamCar) query.append('colorCode', colorCd);
        const url = `${publishDomain}${apiNearestDealers}?${query.toString()}`;
        const response = await fetch(url, {
          method: 'GET',
        });
        if (!response.ok) {
          const details = {};
          details.formName = 'Dealer Locator';
          details.errorType = 'API Error';
          details.errorCode = response.status.toString();
          details.errorDetails = 'Failed to fetch nearest dealers';
          details.webName = 'Search'; // should be aria-label
          details.linkType = 'other';
          analytics.setWebError(details);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dealersData = await response.json();
        const newResults = dealersData?.data?.filter(
          (dealerShop) => dealerShop.channel === 'EXC',
        );
        return newResults ?? [];
      };
      // First attempt with the initial distance
      let filteredDealers = await fetchDealers(
        latitude,
        longitude,
        distance,
        dealer,
      );

      const errorMessageSmallRadius = block.querySelector('.error-message-smallRadius');
      // If fewer than 3 results, try again with a 100 km radius
      if (filteredDealers?.length < 3) {
        const customOptions = document.querySelectorAll("#radius .custom-option");
        errorMessageSmallRadius.style.display = 'block';
        filteredDealers = await fetchDealers(latitude, longitude, 1000, dealer);
        const tempDealers = filteredDealers.slice(0, 3);
        const radiusContainer = block.querySelector('#radius .select-selected');
        const maxRadius = Math.ceil(
          Math.max(...tempDealers.map((dealerShop) => dealerShop.distance)) / 1000
        );
        let newRadius;
        if (maxRadius >= 50 || filteredDealers.length < 3) {
          newRadius = 50;
          filteredDealers = tempDealers;
        } else {
          const tempRadius = Array.from(customOptions).find(
            (option) => Number(option.getAttribute("value")) >= maxRadius
          );
          newRadius = tempRadius ? Number(tempRadius.getAttribute("value")) : maxRadius;
          // Filter dealers based on the new radius
          filteredDealers = filteredDealers.filter(
            (dealerShop) => dealerShop.distance / 1000 <= newRadius
          );
        }
        radiusContainer.setAttribute('value', newRadius);
        if (newRadius === 50) {
          radiusContainer.textContent = `${newRadius}+ Km`;
        } else {
          radiusContainer.textContent = `${newRadius} Km`;
        }

        // Loop through custom-option elements
        customOptions.forEach((option) => {
          option.classList.remove("active");
          if (option.getAttribute("value") == newRadius) {
            option.classList.add("active");
          }
        });
      } else {
        const errorMessageSmallRadius = block.querySelector('.error-message-smallRadius');
        errorMessageSmallRadius.style.display = 'none';
      }
      if (filteredDealers.length > 10 && viewType === 'cardView') {
        filteredDealers = filteredDealers.slice(0, 10);
      }

      // Form submit data layer Implemntation
      const dataLayerFields = {};
      const enquiryExtras = {};
      dataLayerFields.formName = 'Dealer Locator Filter';
      dataLayerFields.linkType = 'other';
      dataLayerFields.webName = 'search-button';
      enquiryExtras.pincode = block.querySelector('#pincode')?.value;
      enquiryExtras.city = block.querySelector('#city .select-selected')?.getAttribute('value').trim();
      enquiryExtras.radius = `${distance}km`;
      enquiryExtras.model = block.querySelector('#showcasing .select-selected')?.textContent.trim();

      const visitingComponent = block.querySelector('#visiting')?.closest('.filter-group');
      if (isComponentVisibleInDom(visitingComponent)) {
        enquiryExtras.dealerType = block.querySelector('#visiting .select-selected')?.textContent.trim();
      }

      const variantComponent = block.querySelector('#carVariant')?.closest('.filter-group');
      if (isComponentVisibleInDom(variantComponent)) {
        enquiryExtras.variant = variantComponent.querySelector('#carVariant .select-selected')?.textContent.trim();
      }
      const colorComponent = block.querySelector('#colours')?.closest('.filter-group');
      if (isComponentVisibleInDom(colorComponent)) {
        enquiryExtras.color = colorComponent.querySelector('#colours .select-selected')?.textContent.trim();
      }

      onSuccess(dataLayerFields, enquiryExtras);
      return filteredDealers;
    } catch (error) {
      console.warn('Error fetching nearest dealers:', error);
      return [];
    }
  }
  function setTranslationEffect() {
    const dealerCards = block.querySelector('.dealer-cards');
    const totalDealerCards = dealerCards?.children?.length;
    const dealerCardsStyle = window.getComputedStyle(dealerCards);
    const nextBtn = block.querySelector('.next-btn');
    const prevBtn = block.querySelector('.prev-btn');

    // Define the width of each card (adjust based on your actual card width and margin if any)
    const dealerCardGap = parseFloat(dealerCardsStyle.getPropertyValue('gap'));
    const dealerCardWidth = dealerCards?.querySelector('.dealer-card').offsetWidth;
    const cardWidth = dealerCardWidth + dealerCardGap;
    const cardsToMove = 2;
    let currentTranslateX = 0;
    let maxTranslateX;
    if (totalDealerCards % 2 === 0) {
      maxTranslateX = -(totalDealerCards - 2) * cardWidth;
    } else {
      maxTranslateX = -(totalDealerCards - 1) * cardWidth;
    }

    function moveCarousel(direction) {
      const moveDistance = cardWidth * cardsToMove;

      if (direction === 'next') {
        currentTranslateX -= moveDistance;
      } else if (direction === 'prev') {
        currentTranslateX += moveDistance;
      }
      // If at the start, disable prev button
      if (currentTranslateX === 0) {
        prevBtn.classList.add('inactive');
        nextBtn.classList.remove('inactive');
      } else if (currentTranslateX <= maxTranslateX) {
        // If at the end, disable next button
        nextBtn.classList.add('inactive');
        prevBtn.classList.remove('inactive');
      } else {
        // If in between, enable both buttons
        prevBtn.classList.remove('inactive');
        nextBtn.classList.remove('inactive');
      }
      dealerCards.style.transform = `translateX(${currentTranslateX}px)`;
    }

    // Event listeners for buttons
    nextBtn.addEventListener('click', () => moveCarousel('next'));
    prevBtn.addEventListener('click', () => moveCarousel('prev'));
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

  function storeFilterValues() {
    const filters = {
      radius: block.querySelector('#radius .select-selected')?.getAttribute('value'),
      pincode: block.querySelector('#pincode')?.value,
      showcasingValue: block.querySelector('#showcasing .select-selected')?.getAttribute('value'),
      showcasingTextContent: block.querySelector('#showcasing .select-selected')?.textContent,
      variantValue: block.querySelector('#carVariant .select-selected')?.getAttribute('value'),
      colorValue: block.querySelector('#colours .select-selected')?.getAttribute('value'),
      selectedCity: block.querySelector('#city .select-selected')?.getAttribute('value'),
      selectedLat: block.querySelector('#city .select-selected')?.getAttribute('data-lat'),
      selectedLong: block.querySelector('#city .select-selected')?.getAttribute('data-long'),
    };
    sessionStorage.setItem('dealerLocatorFilters', JSON.stringify(filters));
  }
  function applyFilterValuesToMap() {
    const storedFilters = JSON.parse(sessionStorage.getItem('dealerLocatorFilters'));
    if (storedFilters) {
      // Apply these filters to initialize the map or fetch data
      block.querySelector('#radius .select-selected').textContent = `${storedFilters.radius} Km`;
      block.querySelector('#radius .select-selected').setAttribute('value', storedFilters.radius);
      block.querySelector('#city .select-selected').textContent = storedFilters.selectedCity;
      block.querySelector('#city .select-selected').setAttribute('value', storedFilters.selectedCity);
      block.querySelector('#city .select-selected').setAttribute('data-lat', storedFilters.selectedLat);
      block.querySelector('#city .select-selected').setAttribute('data-long', storedFilters.selectedLong);
      block.querySelector('#pincode').setAttribute('value', storedFilters.pincode);
      block.querySelector('#pincode').value = storedFilters.pincode;
      block.querySelector('#showcasing .select-selected').textContent = storedFilters.showcasingTextContent;
      block.querySelector('#showcasing .select-selected').setAttribute('value', storedFilters.showcasingValue);
      block.querySelector('#carVariant .select-selected').setAttribute('value', storedFilters.variantValue);
      block.querySelector('#colours .select-selected').setAttribute('value', storedFilters.colorValue);
    }
  }
  async function updateDealerLocatorConfig() {
    const component = block.querySelector('.dealers-container');
    if (viewType === 'cardView') {
      component.classList.add('cardView');
    } else {
      component.classList.add('mapView');
    }
    if (viewType === 'mapView') {
      applyFilterValuesToMap();
      initMapView = true;
    }
    const visiting = block.querySelector('#visiting .select-selected')?.getAttribute('value');
    const radius = block.querySelector('#radius .select-selected')?.getAttribute('value');
    const selectedCityOption = block.querySelector('#city .select-selected');
    const latitude = selectedCityOption?.getAttribute('data-lat');
    const longitude = selectedCityOption?.getAttribute('data-long');
    const dealerId = currentUrl.searchParams.get('dealerId') || '';
    const modelCode = block.querySelector('#showcasing .select-selected')?.getAttribute('value') || '';
    const variantCode = block.querySelector('#carVariant .select-selected')?.getAttribute('value');
    const colorCd = block.querySelector('#colours .select-selected')?.getAttribute('value');
    const codes = { modelCode, variantCode, colorCd };
    let dealer;
    switch (visiting) {
      case 'ds':
        dealer = ['S'];
        break;
      case 'sc':
        dealer = ['2S'];
        break;
      case 'tv':
        dealer = ['3S'];
        break;
      default:
        dealer = ['S', '2S', '3S'];
    }
    let allDealers = [];

    // Check if we are on the first load and coming to the map view
    const storedDealers = sessionStorage.getItem('allDealers') ? JSON.parse(sessionStorage.getItem('allDealers')) : null;
    if (!storedDealers || storedDealers.city !== selectedCityOption?.getAttribute('value') || storedDealers.radius !== radius) {
      let effectiveRadius = radius === '50' ? 1000 : radius;
      allDealers = await getNearestDealers(latitude, longitude, effectiveRadius, dealer, codes, (dataLayerDetails, enquiryExtras) => {
        if (isPageLoad) {
          analytics.setEnquirySubmitDetails(dataLayerDetails, enquiryExtras, false);
        } else {
          isPageLoad = true;
        }
      });
      const allDealersData = {
        city: selectedCityOption?.getAttribute('value'),
        allDealers,
      };
      sessionStorage.setItem('allDealers', JSON.stringify(allDealersData));
    } else {
      allDealers = JSON.parse(sessionStorage.getItem('allDealers'))?.allDealers || [];
    }

    if (allDealers?.length < 3) {
      block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
    }

    if (viewType === 'cardView') {
      const cardHeaderContainer = block.querySelector(
        '.dealer-locator .card-header',
      );
      cardHeaderContainer.style.display = 'none';

      const totalDealers = allDealers?.length;
      if (totalDealers >= 3) {
        const headingElement = block.querySelector('.card-view__heading');
        const exploreCTAMob = block.querySelector('.explore-cta-mob');
        const currentText = headingElement?.getAttribute('card-data');
        headingElement.innerHTML = currentText.replace(/\${totalDealers}/g, totalDealers);

        cardHeaderContainer.style.display = 'flex';
        if (isMobile) {
          exploreCTAMob.style.display = 'flex';
        }
      } else {
        cardHeaderContainer.style.display = 'none';
      }
    }
    const mapViewCards = viewType === 'mapView' ? 'map-view-cards' : '';
    const mapViewCard = viewType === 'mapView' ? 'map-view-card closed' : '';
    const dealerCardsHtml = allDealers?.length >= 3 ? `
    <div class="dealer-cards ${mapViewCards}">
    ${allDealers
        .map((dealerShop, index) => {
          const navigationLink = decodeURI((viewType === 'cardView') ? navigateLinkPlaceholder : directionLinkPlaceholder || '')
            .replace('{latitude}', dealerShop?.latitude)
            .replace('{longitude}', dealerShop?.longitude)
            .replace('{dealer-name}', dealerShop?.name)
            .replace('{city-latitude}', latitude)
            .replace('{city-longitude}', longitude);
          primaryDirectionCta?.setAttribute('href', navigationLink);
          primaryDirectionCta?.setAttribute('title', directionCtaTextEl?.textContent?.trim() || '');
          secondaryNavigateCta?.setAttribute('href', navigationLink);
          secondaryNavigateCta?.setAttribute('title', navigateCtaTextEl?.textContent?.trim() || '');
          return `
        <div class="dealer-card card-${index} ${mapViewCard}" dealer-id=${dealerShop?.dealerUniqueCd}>
        <div class="dealer-card-content">
          <div class="dealer-title">
            <span class="dealer-title-text">${dealerShop?.name}</span>
            <span class="bookmark-icon"></span>
          </div>
          <div class="dealer-distance">
             ${dealerShop.distance / 1000 > 1 ? `${(dealerShop.distance / 1000).toFixed(2)} Kms` : `${(dealerShop.distance / 1000).toFixed(2)} Km`}
             ${viewType === 'mapView' ? 'Away' : ''}
          </div>
          <div class="separator"></div>
          <div class="dealer-location">
           <div class="dealer-address">
           ${`${dealerShop?.addr1} `
            + `${dealerShop?.addr2} `
            + `${dealerShop?.addr3} `
            }
           </div>
           <div class="action-cta">
            ${viewType === 'cardView' ? secondaryNavigateCta?.outerHTML : primaryDirectionCta?.outerHTML}
           <span class="arrow-icon"></span>
           </div>
          </div>
          
          <div class="contact-block">
            ${dealerShop?.phone ? `
             <div class="contact-phone">
              <span class="phone-icon"></span>
              <a href="tel:${dealerShop.phone}" aria-label="phone">${dealerShop.phone}</a>
             </div>
            ` : ''}
            ${(dealerShop?.email || dealerShop?.superMail) ? `
             <div class="contact-email">
              <span class="email-icon"></span>
              <a href="mailto:${dealerShop?.email || dealerShop?.superMail}" aria-label="email">${dealerShop?.email || dealerShop?.superMail}</a>
              <span class="copy-icon"></span>
              <div class="success-message-email">${clipboardSuccessMsg}</div>
             </div>
            ` : ''}
             <div class="contact-timing">
             <span class="timing-icon"></span>
             <span class="dealer-state">Open</span> |  <span class="dealer-time">Till 10 PM</span>
             </div>
          </div>
          </div>
          <div class="cta-actions-container card-cta">
              ${createscheduleVisitLink(index)}
              ${createScheduleTestDriveLink(index)}
          </div>
          <div class="cta-actions-container book-my-car-cta">
              <div class="request-cta">${requestQuoteBtn?.outerHTML ?? ''}</div>
              <div class="book-cta">${bookNowBtn?.outerHTML ?? ''}</div>
          </div>
          ${viewType === 'mapView' ? `
          <div class='bottom-action-container'>
            <div class='wrapper'>
             <span class='toggle-arrow'></span>
            </div>
          </div>
          ` : ''}
          ${lastFlow !== '' && index.toString() === sessionStorage.getItem('slectedDelerIndex') ? `<div class='continue-box'>
          <div class='continue-txt'>${completeJourneyText}</div>
          <button class='continue-btn'>${completeCtaText}</button>
          </div>` : `<div class='continue-box'>
          <div class='continue-txt'>Visit Now or Earliest Grand Vitara Test Drive Today*</div>
          </div>` }
        </div>
      `;
        })
        .join('')}
    </div>`
      : '';

    component.innerHTML = dealerCardsHtml;
    block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
    const handleEvent = (element) => {
      sessionStorage.removeItem('isBsvFlowStep');
      sessionStorage.removeItem('payLoadSrv');
      sessionStorage.removeItem('isBtdFlowStep');
      sessionStorage.removeItem('payLoadBtd');
      const index = element.getAttribute('dealarIndex');
      sessionStorage.setItem('slectedDelerIndex', index);
      storeFilterValues();
      const url = new URL(element.getAttribute('redirecturl'), window.location.origin);
      url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
      window.open(url.href, element.querySelector('a')?.target || '_self');
    };
    block.querySelectorAll('.scheduleVisitButton').forEach((btn) => {
      btn.querySelector('a')?.addEventListener('click', (event) => {
        event.preventDefault();
        handleEvent(btn);
      });
    });
    block.querySelectorAll('.sheduleTestDriveButton').forEach((btn) => {
      btn.querySelector('a')?.addEventListener('click', (event) => {
        event.preventDefault();
        handleEvent(btn);
      });
    });
    if (lastFlow !== '') {
      block.querySelector('.continue-btn').addEventListener('click', () => {
        storeFilterValues();
        if (lastFlow === 'srv') {
          const url = new URL(block.querySelector('.scheduleVisitButton').getAttribute('redirecturl'), window.location.origin);
          url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
          window.location.href = url.toString(); // Redirect to the updated URL
        } else {
          const url = new URL(block.querySelector('.sheduleTestDriveButton').getAttribute('redirecturl'), window.location.origin);
          url.searchParams.set('isDealerFlow', 'true'); // Add or update query parameter
          window.location.href = url.toString(); // Redirect to the updated URL
        }
      });
    }
    if (viewType === 'cardView' && dealerId) {
      const allDealerCards = block.querySelectorAll('.dealer-card');
      allDealerCards.forEach((card) => {
        const cardDealerId = card?.getAttribute('dealer-id');
        if (cardDealerId === dealerId) {
          card.classList.add('highlight-card');
          setTimeout(() => {
            card.classList.remove('highlight-card');
          }, 5000);
        }
      });
    }
    if (viewType === 'mapView') {
      const dealerLocatorMapContainer = document.createElement('div');
      dealerLocatorMapContainer.className = 'map-container';
      component.appendChild(dealerLocatorMapContainer);
    }
    block.querySelectorAll('.bookmark-icon').forEach((bookmarkIcon) => {
      bookmarkIcon.addEventListener('click', () => {
        if (bookmarkIcon.classList.contains('active')) {
          bookmarkIcon.classList.remove('active');
        } else {
          bookmarkIcon.classList.add('active');
        }
      });
    });
    if (viewType === 'cardView') {
      const arrowContainer = block.querySelector('.carousel-arrow');
      if (!arrowContainer) {
        return;
      }
      const dealerCardsChildren = block.querySelector('.dealer-cards')?.children?.length;
      if (dealerCardsChildren < 3) {
        arrowContainer.style.display = 'none';
      } else {
        arrowContainer.style.display = 'flex';
        arrowContainer.querySelector('.prev-btn').classList.add('inactive');
        arrowContainer.querySelector('.next-btn').classList.remove('inactive');
      }
    }
    // Select all elements with the class 'copy-icon'
    const copyIcons = block.querySelectorAll('.copy-icon');

    copyIcons.forEach((copyIcon) => {
      const handleCopy = () => {
        const emailAddress = copyIcon.previousElementSibling?.textContent;
        const successMessageContainer = copyIcon.nextElementSibling;
    
        if (emailAddress) {
          navigator.clipboard
            .writeText(emailAddress)
            .then(() => {
              successMessageContainer.style.display = 'block';
              setTimeout(() => {
                successMessageContainer.style.display = 'none';
              }, 2000);
            })
            .catch((err) => {
              console.error('Failed to copy to clipboard:', err);
            });
        } else {
          console.error('No email address found to copy.');
        }
      };
    
      copyIcon.addEventListener('click', handleCopy);
      copyIcon.addEventListener('touchend', handleCopy);
    });
    if (viewType === 'mapView') {
      const bottomActionCTAs = block.querySelectorAll('.bottom-action-container .toggle-arrow');

      bottomActionCTAs.forEach((toggleArrow) => {
        toggleArrow.addEventListener('click', () => {
          const currentCard = toggleArrow.closest('.map-view-card');
          const allCards = block.querySelectorAll('.map-view-card');

          allCards.forEach((card) => {
            if (card !== currentCard) {
              card.classList.add('closed');
            }
          });

          if (currentCard) {
            currentCard.classList.toggle('closed');
          }
        });
      });
    }
    if (viewType === 'cardView' && !isMobile && allDealers?.length >= 3) {
      setTranslationEffect();
    }
    if (viewType === 'mapView') {
      if (Window.DELAYED_PHASE) {
        setMapView(allDealers);
      } else {
        document.addEventListener('delayed-phase', () => {
          setMapView(allDealers);
        });
      }
    }
    if (sessionStorage.getItem('bookDreamCar') === 'true') {
      handleFilterChange('book-my-dream-car');
    }
    else {
      handleFilterChange('schedule-a-visit-or-test-drive');
    }
  }

  async function fetchPinCodeAndCity(latitude, longitude, pincode) {
    try {
      const location = {
        latitude,
        longitude,
        pinCode: pincode,
      };
      return await apiUtils.getGeoLocation(location);
    } catch (error) {
      console.error('Failed to fetch pincode and city:', error);
      return null;
    }
  }
  // Function to convert string to Title Case
 async function toTitleCase(str) {
    return str
      .split(' ') // Split the string by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
      .join(' '); // Join the words back with spaces
  }
  async function handleCityOrPincodeChange(latitude, longitude, pincode) {
    if (!initMapView && sessionStorage.getItem('dealerLocatorFilters')) {
      return;
    }
    if (latitude && longitude) {
      const pincodeInput = block.querySelector('#pincode');
      const result = await fetchPinCodeAndCity(latitude, longitude, null); // null for pincode as we are fetching based on city
      if (result?.length > 0) {
        pincodeInput.setAttribute('value', result[0]?.pinCd);
        pincodeInput.value = result[0]?.pinCd; // Update pincode input with fetched pincode
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'none';
      } else {
        pincodeInput.setAttribute('value', '');
        pincodeInput.value = ''; // Update pincode input with fetched pincode
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'block';
      }
    } else if (pincode) {
      const result = await fetchPinCodeAndCity(null, null, pincode); // null for latitude and longitude as we are fetching based on pincode
      if (result?.length > 0) {
        const selectedCityOption = block.querySelector('#city .select-selected');
        if (selectedCityOption) {
        let cityDesc = result[0]?.cityDesc;
          selectedCityOption.innerHTML = await toTitleCase(result[0]?.cityDesc); // Set the city text in the dropdown
          selectedCityOption.setAttribute('data-lat', result[0]?.latitude);
          selectedCityOption.setAttribute('data-long', result[0]?.longitude);
          selectedCityOption.setAttribute('value', result[0]?.cityDesc);
        }
      } else {
        const errorMsg = block.querySelector('.error-message-pincode');
        errorMsg.style.display = 'block';
      }
    }
  }
  function initializePincodeValidation() {
    const pincodeInput = block.querySelector('#pincode');
    const parentElement = pincodeInput.parentNode;

    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message-pincode');
    errorMessage.textContent = incorrectPincodeMsg;
    parentElement.insertBefore(errorMessage, pincodeInput.nextSibling);
    errorMessage.style.display = 'none'; // Initially hidden

    pincodeInput.addEventListener('input', () => {
      const value = pincodeInput.value.replace(/\D/g, '');
      pincodeInput.value = value;
      pincodeInput.setAttribute('value', value);
      const pincode = pincodeInput.value.trim();

      // Restrict to a maximum of 6 digits
      if (pincode.length > 6) {
        pincodeInput.value = pincode.substring(0, 6); // Truncate the input to 6 digits
      }

      // Validate pincode length
      if (pincode.length < 6) {
        errorMessage.style.display = 'block'; // Show error message if less than 6 digits
      } else {
        errorMessage.style.display = 'none'; // Hide error message when 6 digits are entered
        handleCityOrPincodeChange('', '', pincode); // Call function to handle city update with the pincode
      }
    });
  }
  function fetchDefaultLocation() {
    return utility.getSelectedLocation()?.cityName || defaultCityName;
  }
  async function initializeCitySelection() {
    const cityDropdownOptions = block.querySelectorAll('#city .select-items .custom-option');
    const defaultLocation = await fetchDefaultLocation();

    cityDropdownOptions.forEach((cityOption) => {
      cityOption.addEventListener('click', () => {
        const latitude = cityOption.getAttribute('data-lat');
        const longitude = cityOption.getAttribute('data-long');

        if (latitude && longitude) {
          handleCityOrPincodeChange(latitude, longitude, null);
        }
      });
    });

    if (defaultLocation) {
      const defaultCityOption = Array.from(cityDropdownOptions).find((cityOption) => {
        const cityValue = cityOption.getAttribute('value')?.trim().toLowerCase();
        return cityValue === defaultLocation.trim().toLowerCase();
      });

      if (defaultCityOption) {
        // Trigger the click event on the matching city option
        requestAnimationFrame(() => {
          defaultCityOption.click();
          initDefaultCityDataLayer = true;
          setTimeout(() => {
            updateDealerLocatorConfig();
          }, 0);
        });
      } else {
        block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
        initDefaultCityDataLayer = true;
        console.warn(`No matching city option found for ${defaultLocation}`);
      }
    } else {
      block.querySelector('.dealers-container')?.classList?.remove('dealers-container-initial');
      initDefaultCityDataLayer = true;
    }
  }
  function setupCustomSelect(selectId, selectType) {
    const selector = block.querySelector(`#${selectId} .select-selected`);
    const items = block.querySelector(`#${selectId} .select-items`);

    // Function to hide all dropdowns
    function hideAllDropdowns() {
      const allItems = block.querySelectorAll('.select-items');
      const allSelectors = block.querySelectorAll('.select-selected');
      allItems.forEach((item) => item.classList.add('select-hide'));
      allItems.forEach((item) => item.classList.remove('select-show'));
      allSelectors.forEach((sel) => sel.classList.remove('active'));
    }

    function updateActiveOption(selectId, selectedValue) {
      const options = block.querySelectorAll(`#${selectId} .custom-option`);
      options.forEach((option) => {
        if (option.getAttribute('value') === selectedValue) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
    // Attach event listeners
    selector.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click bubbling
      const isDropdownOpen = !items.classList.contains('select-hide');

      hideAllDropdowns(); // Hide all other dropdowns before toggling
      if (!isDropdownOpen) {
        items.classList.remove('select-hide');
        items.classList.add('select-show');
        selector.classList.add('active');
      } else {
        items.classList.add('select-hide');
        items.classList.remove('select-show');
        selector.classList.remove('active');
      }
    });

    items.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click bubbling
      const clickedOption = event.target.closest('.custom-option');
      if (clickedOption) {
        const selectedText = clickedOption.querySelector('.select__option')?.textContent;
        const selectedValue = clickedOption?.getAttribute('value');
        selector.textContent = selectedText;
        selector.setAttribute('value', selectedValue);

        if (selectType === 'city') {
          selector.setAttribute('data-lat', clickedOption.getAttribute('data-lat'));
          selector.setAttribute('data-long', clickedOption.getAttribute('data-long'));
        }
        if (selectType === 'showcasing') {
          // eslint-disable-next-line
          updateCarVariants(selectedValue);
        }

        items.classList.add('select-hide');
        items.classList.remove('select-show');
        selector.classList.remove('active');

        updateActiveOption(selectId, selectedValue);

        const changeEvent = new Event('change');
        selector.dispatchEvent(changeEvent);
      }
    });

    // Hide dropdowns on outside click
    document.addEventListener('click', () => {
      hideAllDropdowns();
    });
  }

  async function updateShowcasingCarValue() {
    const channel = 'EXC';
    const apiUrl = publishDomain + apiExShowroomDetail;
    const params = { forCode, channel };
    if (!apiUrl) { return; }
    const url = new URL(apiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.href, {
        method: 'GET',
      });
      if (!response.ok) {
        const details = {};
        details.formName = 'Dealer Locator';
        details.errorType = 'API Error';
        details.errorCode = response.status.toString();
        details.errorDetails = 'Failed to load models';
        details.webName = block.querySelector('#showcasing')?.getAttribute('name');
        details.linkType = 'other';
        analytics.setWebError(details);
      }
      const data = await response.json();
      const showcasingCarValueDiv = block.querySelector(
        '#showcasing>.select-items',
      );
      showcasingCarValueDiv.innerHTML = `
      <div class="custom-option active" value="">
        <span class="select__icon"></span>
        <div class="select__option">${allCarText?.trim()}</div>
      </div>
      ${data?.error === false && data?.data
          ? data.data.models
            .map(
              ({ modelCd, modelDesc }) => `
        <div class="custom-option" value="${modelCd.trim()}">
          <span class="select__icon"></span>
          <div class="select__option">${capitalizeFirstLetter(
                modelDesc.trim(),
              )}</div>
        </div>
      `,
            )
            .join('')
          : ''
        }
    `;
    } catch (error) {
      throw new Error('Error fetching showcasing car data:', error);
    }
  }
  function handleModelCodeComparison(modelcode) {
    const options = block.querySelectorAll('#showcasing .custom-option');
    options?.forEach((option) => {
      const optionValue = option.getAttribute('value');
      if (optionValue === modelcode) {
        requestAnimationFrame(() => {
          option.click();
        });
      }
    });
  }

  async function fetchCarVariants(modelcode) {
    return apiUtils.getCarVariantsByModelCd(modelcode);
  }
  async function fetchCarVariantsColor(variantCode) {
    return apiUtils.getCarVariantsColoursByVariantCd(variantCode);
  }

  function updateRadiusValue() {
    const radiusValueDiv = block.querySelector('#radius>.select-items');
    radiusValueDiv.innerHTML = radiusValue
      .map(
        (element) => {
          if (parseInt(element.trim(), 10) === 10) {
            return `
      <div class="custom-option active" value="${parseInt(element.trim(), 10)}">
        <span class="select__icon"></span>
        <div class="select__option" value="${parseInt(element.trim(), 10)} ${distanceText}">${element.trim()} ${distanceText}</div>
      </div>
    `
          }
          else {
            return `
      <div class="custom-option" value="${parseInt(element.trim(), 10)}">
        <span class="select__icon"></span>
        <div class="select__option" value="${parseInt(element.trim(), 10)} ${distanceText}">${element.trim()} ${distanceText}</div>
      </div>
    `
          }
        }
      )
      .join('');
  }

  async function autoSelectNearestCity(latitude, longitude) {
    let nearestCity = null;
    let pincode = null;
    const mapMyIndiaApiUrl = `${mapmyindiaUrl + mapmyindiaKey}/rev_geocode`;
    const params = {
      lat: latitude,
      lng: longitude,
    };

    const url = new URL(mapMyIndiaApiUrl);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json();
      nearestCity = data?.results[0]?.city;
      pincode = data?.results[0]?.pincode;

      const cityDiv = block.querySelector('#city');
      const selectSelectedDiv = cityDiv.querySelector('.select-selected');
      const pincodeInput = block.querySelector('#pincode');
      let cityExists = false;
      const cityOptions = cityDiv.querySelectorAll(
        '.select-items .custom-option',
      );

      cityOptions.forEach((option) => {
        const optionText = option.querySelector('.select__option')?.textContent;
        if (
          optionText.toUpperCase().trim() === nearestCity.toUpperCase().trim()
        ) {
          cityExists = true;
          selectSelectedDiv.textContent = nearestCity.trim();
          selectSelectedDiv.setAttribute('value', nearestCity.trim());
          selectSelectedDiv.setAttribute(
            'data-lat',
            option.getAttribute('data-lat'),
          );
          selectSelectedDiv.setAttribute(
            'data-long',
            option.getAttribute('data-long'),
          );
        }
      });

      if (!cityExists) {
        selectSelectedDiv.textContent = nearestCity.trim();
        selectSelectedDiv.setAttribute('value', nearestCity.trim());
        selectSelectedDiv.removeAttribute('data-lat');
        selectSelectedDiv.removeAttribute('data-long');
      }

      pincodeInput.value = pincode;
      const errorMessage = block.querySelector('.error-message-pincode');
            if(errorMessage){
              errorMessage.style.display = 'none';
            }
    } catch (error) {
      throw new Error('Error fetching city from MapMyIndia API:', error);
    }
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

  async function fetchCityData() {
    const urlWithParams = `${publishDomain}${apiDealerOnlyCities}?channel=EXC`;
    try {
      const response = await fetch(urlWithParams, {
        method: 'GET',
      });
      if (response.ok) {
        const result = await response.json();
        return result?.error === false && result?.data
          ? result.data
          : [
            {
              cityDesc: 'AGARTALA',
              latitude: '28.633',
              longitude: '77.2194',
            },
          ];
      }
    } catch (e) {
      throw new Error('Error fetching city data:', e);
    }
    return [
      {
        cityDesc: 'AGARTALA',
        latitude: '28.633',
        longitude: '77.2194',
      },
    ];
  }

  async function updateCities() {
    const cityData = await fetchCityData();
    const cityValueDiv = block.querySelector('#city > .select-items');
    cityValueDiv.innerHTML = cityData
      .map(
        ({ cityDesc, latitude, longitude }) => `
      <div class="custom-option" data-lat="${latitude}" data-long="${longitude}" value="${capitalizeFirstLetter(cityDesc)}">
        <span class="select__icon"></span>
        <div class="select__option"> ${cityDesc ? capitalizeFirstLetter(cityDesc.trim()) : ''}</div>
      </div>
    `,
      )
      .join('');
    const detectLocationIcon = block.querySelector('#locator-icon');
    detectLocationIcon.addEventListener('click', requestLocationPermission);
  }
  async function updateCarVariantsColors(variantCode) {
    const colors = await fetchCarVariantsColor(variantCode);
    const coloursValueDiv = block.querySelector('#colours> .select-items');
    coloursValueDiv.innerHTML = colors
      .map(
        (color, index) => `
      <div class="custom-option ${index === 0 ? `active` : ``}" value="${color?.eColorCd}">
        <span class="select__icon"></span>
        <div class="select__option" value="${color?.eColorCd}">${color?.eColorDesc}</div>
        <span class="colour-box" value="${color?.hexCode}"></div>
      </div>
    `,
      )
      .join('');
    block.querySelector('#colours .select-selected').textContent = colors[0]?.eColorDesc || '';
    block.querySelector('#colours .select-selected').setAttribute('value', colors[0]?.eColorCd || '');
    block.querySelectorAll('.colour-box').forEach((box) => {
      const colorData = box?.getAttribute('value');
      if (colorData) {
        const colorArray = colorData?.split(',');
        if (colorArray.length === 2) {
          box.style.background = `linear-gradient(135deg, ${colorArray[0]} 50%, ${colorArray[1]} 50%)`;
        } else {
          const [color] = colorArray;
          box.style.background = color;
        }
      }
    });
    addExploreLessToAllSelectItems();
  }
  async function updateCarVariants(modelcode) {
    const variants = await fetchCarVariants(modelcode);
    const variantsValueDiv = block.querySelector('#carVariant> .select-items');
    variantsValueDiv.innerHTML = variants
      .map(
        (variant, index) => `
      <div class="custom-option ${index === 0 ? `active` : ``}" value="${variant?.variantCd}">
        <span class="select__icon"></span>
        <div class="select__option" value="${variant?.variantCd}">${variant?.variantName}</div>
      </div>
    `,
      )
      .join('');
    block.querySelector('#carVariant .select-selected').textContent = variants[0]?.variantName || '';
    block.querySelector('#carVariant .select-selected').setAttribute('value', variants[0]?.variantCd || '');
    await updateCarVariantsColors(variants[0]?.variantCd);
    initVariantsAndColorsDataLayer();
  }

  function handleFilterChange(message) {
    const visitingBlock = block.querySelector('#visiting')?.closest('.filter-group');
    const variantBlock = block.querySelector('#carVariant')?.closest('.filter-group');
    const coloursBlock = block.querySelector('#colours')?.closest('.filter-group');
    const showcasingBlock = block.querySelector('.showcasing-block label');
    const bookMyCarHeading = block.querySelector('.book-my-car__heading');
    const cardViewHeading = block.querySelector('.card-view__heading');
    const cardCtaBlocks = block.querySelectorAll('.card-cta');
    const bookMyCarCtaBlocks = block.querySelectorAll('.book-my-car-cta');
    if (message === 'book-my-dream-car') {
      isBookDreamCar = true;
      visitingBlock.style.display = 'none';
      variantBlock.style.display = 'flex';
      coloursBlock.style.display = 'flex';
      showcasingBlock.innerHTML = carModelText;
      if (viewType === 'cardView') {
        bookMyCarHeading.style.display = 'block';
        cardViewHeading.style.display = 'none';
      }
      cardCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'none';
      });
      bookMyCarCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'flex';
      });
    } else {
      isBookDreamCar = false;
      visitingBlock.style.display = 'flex';
      variantBlock.style.display = 'none';
      coloursBlock.style.display = 'none';
      showcasingBlock.innerHTML = showcasingText;
      if (viewType === 'cardView') {
        bookMyCarHeading.style.display = 'none';
      }
      if(cardViewHeading) {
        cardViewHeading.style.display = 'block';
      }
      cardCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'flex';
      });
      bookMyCarCtaBlocks.forEach((ctaBlock) => {
        ctaBlock.style.display = 'none';
      });
    }
  }

  const mapHtml = viewType === 'mapView' ? `
  <div class="map-header">
    <button class="cardDealer"></button>
    <span>${mapHeading?.outerHTML}</span>
  </div>` : '';

  const cardData = block.querySelector('.card-view__heading');
  cardData?.setAttribute('card-data', cardData.innerHTML);

  const cardHtml = `
  ${viewType === 'cardView' ? `
    <div class="card-header">
      ${cardHeading?.outerHTML}
      ${dreamCarHeading?.outerHTML}
      ${!isMobile ? `
        <button class="explore-cta-web map-cta" type="button">
          <a href="${ctaLink}" aria-label="map-view">${ctaText}</a>
        </button>` : ''
      }
    </div>` : ''
    }
  <div class="error-message-smallRadius"><span class="highlight">Oops!</span> Your Search Radius is too small. Here are a few other dealers which can give you a quick delivery.</div>
  <div class="dealers-container dealers-container-initial"></div>
  ${(viewType === 'cardView' && isMobile) ? `
  <button class="explore-cta-mob map-cta">
        <a href="${ctaLink}">${ctaText}</a>
  </button>` : ''}

  ${(viewType === 'cardView' && !isMobile) ? `
  <div class="carousel-arrow">
   <div class="prev-btn inactive"></div>
   <div class="next-btn"></div>
  </div>` : ''}

`;

  const bookMyCarFilterHtml = `
<div class="filter-group carVariant-block">
<label for="carVariant">${carVariantText}</label>
<custom-select id="carVariant" name="carVariant">
  <div class="select-selected"></div>
  <div class="select-items select-hide"></div>
</custom-select>
</div>
<div class="filter-group colours-block">
<label for="colours">${colourText}</label>
<custom-select id="colours" name="colours">
  <div class="select-selected"></div>
  <div class="select-items select-hide"></div>
</custom-select>
</div>
`;

  block.innerHTML = utility.sanitizeHtml(`
        <section class="dealer-locator">
            ${mapHtml}
            <div class="dealer-locator-container">
                <div class="filter-container">
                    <div class="filter-group pincode-block">
                        <label for="pincode">${pincodeText}</label>
                        <input type="text" id="pincode" name="pincode" value="${pincodeValue}"/>
                        <span id="locator-icon" class="filter-icon"></span>
                    </div>
                    <div class="filter-group city-block">
                        <label for="city">${cityText}</label>
                        <custom-select id="city" name="city">
                          <div class="select-selected" data-lat="28.861483" data-long="77.09553" value="Delhi">Delhi</div>
                          <div class="select-items select-hide">
                          </div>
                        </custom-select>
                    </div>
                    <div class="filter-group visiting-block">
                        <label for="visiting">${visitingText}</label>
                        <custom-select id="visiting" name="visiting">
                           <div class="select-selected" value="ds" data-option-value="${dsValue}">${dsValue}</div>
                           ${dsValue && scValue && trueValue ? `<div class="select-items select-hide">
                           ${dsValue ? `<div class="custom-option" value='ds'>
                           <span class="select__icon"></span>
                           <div class="select__option" value="ds" data-option-value="${dsValue}">${dsValue}</div></div>` : ''}
                           ${scValue ? `<div class="custom-option" value='sc'>
                           <span class="select__icon"></span>
                           <div class="select__option" value="sc" data-option-value="${scValue}">${scValue}</div></div>` : ''}
                           ${trueValue ? `<div class="custom-option" value='tv'>
                           <span class="select__icon"></span>
                           <div class="select__option" value="tv" data-option-value="${trueValue}">${trueValue}</div></div>` : ''}
                           </div>` : ''}
                        </custom-select>
                    </div>
                    <div class="filter-group showcasing-block">
                    <label for="showcasing">${showcasingText}</label>
                    <custom-select id="showcasing" name="showcasing">
                      <div class="select-selected" value=''>${allCarText?.trim()}</div>
                      <div class="select-items select-hide"></div>
                    </custom-select>
                  </div>
                  ${bookMyCarFilterHtml}
                  <div class="filter-group radius-block">
                      <label for="radius">${radiusText}</label>
                      <custom-select id="radius" name="radius">
                       <div class="select-selected" value="10">10 km</div>
                       <div class="select-items select-hide"></div>
                      </custom-select>
                  </div>
                    <button class="search-button">${isMobile ? 'Search' : ''}</button>
                </div>
                ${cardHtml}
            </div>
        </section>`);

  async function initializeBlock() {
    if (viewType === 'mapView') {
      initMapView = false;
    } else {
      initMapView = true;
    }
    await updateCities();
    await updateShowcasingCarValue();
    updateRadiusValue();
    ['city', 'showcasing', 'radius', 'carVariant', 'colours'].forEach((id) => setupCustomSelect(id, id));
    if (carModelCode) {
      handleModelCodeComparison(carModelCode);
      await updateCarVariants(carModelCode);
    }

    const carVariantSelector = block.querySelector('#carVariant .select-selected');
    carVariantSelector.addEventListener('change', () => {
      const selectedVariant = carVariantSelector.getAttribute('value');
      updateCarVariantsColors(selectedVariant);
    });

    addExploreLessToAllSelectItems();
    initializePincodeValidation();
    await initializeCitySelection();

    if (viewType === 'mapView') {
      const cardDealerButton = document.querySelector('.cardDealer');
      cardDealerButton.addEventListener('click', () => {
        window.location.href = cardViewLink;
      });
    }

    block.querySelector('.search-button').addEventListener('click', () => {
      sessionStorage.removeItem('dealerLocatorFilters');
      sessionStorage.removeItem('allDealers');
      updateDealerLocatorConfig();
    });
    block.querySelectorAll('.map-cta').forEach((mapCTA) => {
      mapCTA.addEventListener('mouseover', () => {
        storeFilterValues();
      });
      mapCTA.addEventListener('click', (e) => {
        e.preventDefault();
        storeFilterValues();
        const a = mapCTA.querySelector('a');
        window.open(a.href, a.target || '_self');
      });
    });
    initFormDataLayer();
  }
  initializeBlock();
  document.addEventListener('hero-banner-dealer-changed', (event) => {
    const { message } = event.detail;
    handleFilterChange(message);
    if (message === 'book-my-dream-car') {
      sessionStorage.setItem('bookDreamCar', 'true');
    }
    else {
      sessionStorage.setItem('bookDreamCar', 'false');
    }
  });

  block.addEventListener('click', (event) => {
    const element = event.target;
    if (!element) {
      return;
    }
    if (element.tagName === 'A' && (element.closest('.action-cta') || element.closest('.visit-cta') || element.closest('.test-cta') || element.closest('.book-cta') || element.closest('.request-cta'))) {
      const data = {};
      data.componentName = block.dataset.blockName;
      data.componentTitle = `Dealer|${utility.textContentChecker(element.closest('.dealer-card')?.querySelector('.dealer-title-text'))}`;
      data.componentType = (element.closest('.action-cta')) ? 'link' : 'button';
      data.webName = utility.textContentChecker(element);
      data.linkType = element;
      analytics.setButtonDetails(data);
    }
  });
}
