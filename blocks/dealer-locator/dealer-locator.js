import apiUtils from '../../commons/utility/apiUtils.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../commons/utility/utility.js';
import utilityNexa from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const [contentEl, dealerCtaEl] = block.children;
  const children = contentEl?.firstElementChild?.children || [];
  const [
    titleEl,
    subtitleEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    errorMsgEl,
    distanceMsgEl,
    dealerDistanceEl,
    iconFirstEl,
    altTextFirstEl,
    iconSecondEl,
    altTextSecondEl,
    iconThirdEl,
    altTextThirdEl,
    showDealerImageEl,
  ] = children;
  const dealerCta = dealerCtaEl?.querySelector('a');
  dealerCta?.setAttribute('target', dealerCtaEl?.querySelector('p:last-child')?.textContent?.trim() || '_self');

  const { defaultLatitude: initalLat, defaultLongitude: initalLong, dealerRadius } = await fetchPlaceholders();
  const defaultLatitude = utilityNexa.getSelectedLocation()?.location?.latitude ?? initalLat;
  const defaultLongitude = utilityNexa.getSelectedLocation()?.location?.longitude ?? initalLong;

  const dealerRadiusArray = [...new Set(dealerRadius?.split(',')
    .map((radius) => {
      const parsedRadius = parseInt(radius.trim(), 10);
      return parsedRadius > 0 ? parsedRadius : 50000; // Default to 50000 if radius is invalid
    }))];

  const title = titleEl;
  const subtitle = utilityNexa.textContentChecker(subtitleEl);
  const primaryCta = ctaUtils.getLink(
    ctaLinkEl,
    ctaTextEl,
    ctaTargetEl,
    'primary',
  );
  const firstIconImg = iconFirstEl?.querySelector('img')?.src || '';
  const firstAltText = utilityNexa.textContentChecker(altTextFirstEl);
  const secondIconImg = iconSecondEl?.querySelector('img')?.src || '';
  const secondAltText = utilityNexa.textContentChecker(altTextSecondEl);
  const thirdIconImg = iconThirdEl?.querySelector('img')?.src || '';
  const thirdAltText = utilityNexa.textContentChecker(altTextThirdEl);
  const errorMsg = utilityNexa.textContentChecker(errorMsgEl);
  const distanceMsg = utilityNexa.textContentChecker(distanceMsgEl);
  const dealerDistance = utilityNexa.textContentChecker(dealerDistanceEl);

  const showDealerImg = showDealerImageEl?.textContent?.trim()?.toLowerCase() === 'yes';
  const iconImages = [
    { img: firstIconImg, alt: firstAltText },
    { img: secondIconImg, alt: secondAltText },
    { img: thirdIconImg, alt: thirdAltText },
  ];

  block.innerHTML = `
    <div class="container-dealerLocator">
      ${title ? `<div class="locator-title">${title.outerHTML}</div>` : ''}
      <div class="dealersLocator-content">
        <div class="dealersLocator-actions">
        ${subtitle ? `<div class="locator-subtitle">${subtitle?.replace('{number}', 3)}</div>` : ''}
        ${primaryCta?.outerHTML ?? ''}
      </div>
      <div class="dealer-list-section dealer-list-skeleton" data-noindex="true" aria-hidden="true">
        <a class="dealer-card" href="#" target="_self">
          <img class="dealer-image" src="" alt="Dealer">
          <div class="icon-container">
            <img src="${firstIconImg}" alt="${firstAltText}" />
          </div>
          <div class="dealer-info">
            <p class="dealer-name">DEALER NAME 1 (A PLACEHOLDER TEXT FOR LOADING)</p>
            <p class="dealer-distance">0.00 Km Away</p>
            <p class="dealer-address">ADDRESS PLACEHOLDER</p>
          </div>
        </a>
        <a class="dealer-card" href="#" target="_self">
          <img class="dealer-image" src="" alt="Dealer">
          <div class="icon-container">
            <img src="${secondIconImg}" alt="${secondAltText}" />
          </div>
          <div class="dealer-info">
            <p class="dealer-name">DEALER NAME 2 (A PLACEHOLDER TEXT FOR LOADING)</p>
            <p class="dealer-distance">0.59 Km Away</p>
            <p class="dealer-address">ADDRESS PLACEHOLDER</p>
          </div>
          <div class="more-info"><span class="dealer-link">${utilityNexa.textContentChecker(dealerCta)}</span></div>
        </a>
        <a class="dealer-card" href="#" target="_self">
          <img class="dealer-image" src="" alt="Dealer">
          <div class="icon-container">
            <img src="${thirdIconImg}" alt="${thirdAltText}" />
          </div>
          <div class="dealer-info">
            <p class="dealer-name">DEALER NAME 3 (A PLACEHOLDER TEXT FOR LOADING)</p>
            <p class="dealer-distance">14.79 Km Away</p>
            <p class="dealer-address">ADDRESS PLACEHOLDER</p>
          </div>
          <div class="more-info"><span class="dealer-link">${utilityNexa.textContentChecker(dealerCta)}</span></div>
        </a>
      </div>
      </div>
    </div>
  `;

  async function getNearestDealersAndUpdate(latitude, longitude) {
    const dealerLocatorContainer = document.createElement('div');
    dealerLocatorContainer.classList.add('dealer-list-section');
    let dealersList = [];

    const allDealers = await Promise.all(dealerRadiusArray.map(async (radius) => {
      try {
        const response = await apiUtils.getNearestDealers(latitude, longitude, radius,'S');
        return response.filter((dealer) => dealer.channel === 'EXC');
      } catch (error) {
        return [];
      }
    }));

    const flatDealers = allDealers.find((item) => item.length >= 3);
    if (flatDealers?.length >= 3) {
      dealersList = flatDealers.slice(0, 3);
    }
    dealersList.forEach((dealer, index) => {
      const card = document.createElement('a');
      card.className = 'dealer-card';
      card.href = (dealerCta?.href) ? `${dealerCta.href}?dealerId=${dealer.dealerUniqueCd}` : '#';
      card.target = dealerCta?.target ?? '_self';

      const dealerImage = document.createElement('img');
      dealerImage.className = 'dealer-image';
      dealerImage.src = dealer.imageUrl ?? '';
      dealerImage.alt = dealer.name;

      const dealerInfo = document.createElement('div');
      dealerInfo.className = 'dealer-info';

      const distanceTag = document.createElement('p');
      distanceTag.textContent = (dealer?.distance >= 0) ? dealerDistance.replace('{distance}', ((dealer.distance / 1000).toFixed(2))) : distanceMsg;
      distanceTag.className = 'dealer-distance';
      const name = document.createElement('p');
      name.textContent = dealer.name;
      name.className = 'dealer-name';

      let fullAddress = dealer.addr1 || '';
      if (dealer.addr2) fullAddress += ` ${dealer.addr2}`;
      if (dealer.addr3) fullAddress += ` ${dealer.addr3}`;
      if (dealer.cityDesc) fullAddress += ` ${dealer.cityDesc}`;
      if (dealer.pin) fullAddress += ` ${dealer.pin}`;
  
      fullAddress = fullAddress.trim();
      const address = document.createElement('p');
      address.textContent = fullAddress;
      address.className = 'dealer-address';

      const moreInfoLink = document.createElement('span');
      moreInfoLink.textContent = `${utilityNexa.textContentChecker(dealerCta)}`;
      moreInfoLink.className = 'dealer-link';

      const moreInfo = document.createElement('div');
      moreInfo.classList.add('more-info');
      moreInfo.appendChild(moreInfoLink);

      dealerInfo.appendChild(name);
      dealerInfo.appendChild(distanceTag);
      dealerInfo.appendChild(address);

      card.appendChild(dealerImage);

      if (showDealerImg) {
        const existingImages = card.querySelectorAll('.icon-container img, .dealer__image');
        existingImages.forEach((img) => img.remove());
        const imageSrc = iconImages[index]?.img || dealer.imageUrl;
        const imageAlt = iconImages[index]?.alt || dealer.name;

        if (imageSrc) {
          const iconHtml = `
      <div class="icon-container">
        <img src="${imageSrc}" alt="${imageAlt}" class="${iconImages[index]?.img ? 'icon icon__first' : 'dealer__image'}">
      </div>
    `;
          card.insertAdjacentHTML('beforeend', utility.sanitizeHtml(iconHtml));
        }
      }

      card.appendChild(dealerInfo);
      card.appendChild(moreInfo);
      dealerLocatorContainer.appendChild(card);
    });

    if (dealersList.length < 3) {
      const message = document.createElement('p');
      message.textContent = errorMsg;
      dealerLocatorContainer.appendChild(message);
    }

    block.querySelector('.dealer-list-section').replaceWith(dealerLocatorContainer);
    block.querySelector('.locator-subtitle').textContent = subtitle.replace('{number}', dealersList.length);
  }
  const locationObj = {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  };
  getNearestDealersAndUpdate(locationObj.latitude, locationObj.longitude);

  document.addEventListener('updateLocation', async (event) => {
    locationObj.latitude = event?.detail?.location?.latitude.trim() || defaultLatitude;
    locationObj.longitude = event?.detail?.location?.longitude.trim() || defaultLongitude;
    getNearestDealersAndUpdate(locationObj.latitude, locationObj.longitude);
  });

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};
    let webName = e.target.textContent;
    const dealerCard = e.target.closest('.dealer-card');
    let componentType = 'button';
    if (dealerCard) {
      const linkText = utilityNexa.textContentChecker(dealerCard.querySelector('.dealer-link'));
      const dealerName = utilityNexa.textContentChecker(dealerCard.querySelector('.dealer-name'));
      webName = (dealerName ? `${linkText}:${dealerName}` : `${linkText}`);
      componentType = 'link';
    }
    pageDetails.componentName = block.getAttribute('data-block-name');
    pageDetails.componentTitle = e.target.closest('.container-dealerLocator').querySelector('.locator-title').textContent;
    pageDetails.componentType = componentType;
    pageDetails.webName = webName;
    pageDetails.linkType = e.target.closest('a');

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.primary') || e.target.closest('.dealer-card')) {
      setLinkDetails(e);
    }
  });
}
