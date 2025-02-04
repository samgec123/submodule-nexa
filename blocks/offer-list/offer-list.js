import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  // Function to create the primary offer card
  function createPrimaryOffer(card) {
    // Destructure card's children into respective variables
    const [
      desktopImgEl,
      mobileImageEl,
      titleEl,
      descriptionEl,
      ctaEl,
      ctaTargetEL,
    ] = card.children;

    // Extract image sources and attributes or set default values if elements do not exist
    const desktopImgSrc = desktopImgEl?.querySelector('img')?.src || '';
    const desktopImgAlt = desktopImgEl?.querySelector('img')?.alt || '';
    const mobileImgSrc = mobileImageEl?.querySelector('img')?.src || '';
    const title = titleEl?.innerText?.trim() || '';
    const description = descriptionEl?.innerText?.trim() || '';
    const a = ctaEl?.querySelector('.button-container a') || '';
    const target = ctaTargetEL?.innerText?.trim() || '';

    // Modify link element if it exists
    if (a) {
      a.classList.add('button', 'primary__btn');
      if (target) {
        a.setAttribute('target', target);
      }
    }

    // Create and populate the left container
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('left-container');
    Array.from(card.attributes)
      .forEach((attr) => leftContainer.setAttribute(attr.name, attr.value));

    leftContainer.innerHTML = `
   <picture>
      <source srcset="${desktopImgSrc}" media="(min-width: 768px)">
      <source srcset="${mobileImgSrc}" media="(max-width: 768px)">
      <img src="${desktopImgSrc}" loading="lazy" alt="${desktopImgAlt}"/>
   </picture>
   <div class="light-teaser buyers-guide-teaser">
      <div class="teaser__card teaser-grey">
         <div class="teaser__content">
            <div class="teaser__info left-img-over-text">
               <div class="teaser__title">${title ? `<p>${title}</p>` : ''
}</div>
               <div class="teaser__description">${description ? `<p>${description}</p>` : ''
}</div>
            </div>
            <div class="teaser__action-btn">${a ? a.outerHTML : ''}</div>
         </div>
      </div>
   </div>
  `;

    return leftContainer.outerHTML;
  }

  // Function to create the secondary offer card
  function createSecondaryOffer(card) {
    // Destructure card's children into respective variables
    const [
      desktopImgEl,
      mobileImageEl,
      titleEl,
      descriptionEl,
      ctaEl,
      ctaTargetEL,
    ] = card.children;

    // Extract image sources and attributes or set default values if elements do not exist
    const desktopImgSrc = desktopImgEl?.querySelector('img')?.src || '';
    const desktopImgAlt = desktopImgEl?.querySelector('img')?.alt || '';
    const mobileImgSrc = mobileImageEl?.querySelector('img')?.src || '';
    const title = titleEl?.innerText?.trim() || '';
    const description = descriptionEl?.innerText?.trim() || '';
    const a = ctaEl?.querySelector('.button-container a') || '';
    const target = ctaTargetEL?.innerText?.trim() || '';

    // Modify link element if it exists
    if (a) {
      a.classList.add('button', 'primary__btn');
      if (target) {
        a.setAttribute('target', target);
      }
    }

    // Create and populate the right container
    const secCardContainer = document.createElement('div');
    secCardContainer.classList.add('right-container__card-1');
    Array.from(card.attributes).forEach(
      (attr) => secCardContainer.setAttribute(attr.name, attr.value),
    );

    secCardContainer.innerHTML = `
    <picture class="image-container">
      <source media="(min-width: 768px)" srcset="${desktopImgSrc}">
      <source media="(max-width: 768px)" srcset="${mobileImgSrc}">
      <img src="${desktopImgSrc}" loading="lazy" alt="${desktopImgAlt}"/>
    </picture>
    <div class="right-container__content">
      <div class="offerList__content img-over-text">
       <div class="teaser__heading">
        <div class="teaser__title">${title ? `<p>${title}</p>` : ''}</div>
        ${description ? `<p>${description}</p>` : ''}
        </div>
        <div class="offerList__action">${a ? a.outerHTML : ''}</div>
      </div>
    </div>
  `;

    return secCardContainer.outerHTML;
  }

  // Function to create a general offer card
  function createGeneralOffer(card, textClass) {
    // Destructure card's children into respective variables
    const [, , titleEl, descriptionEl, ctaEl, ctaTargetEL] = card.children;

    // Extract title and description or set default values if elements do not exist
    const title = titleEl?.innerText?.trim() || '';
    const description = descriptionEl?.innerText?.trim() || '';
    const a = ctaEl?.querySelector('.button-container a') || '';
    const target = ctaTargetEL?.innerText?.trim() || '';

    // Modify link element if it exists
    if (a) {
      a.classList.add('button', 'primary__btn');
      if (target) {
        a.setAttribute('target', target);
      }
    }

    // Create and populate the general card container
    const genCardContainer = document.createElement('div');
    genCardContainer.classList.add('right-container__card-2');
    Array.from(card.attributes).forEach(
      (attr) => genCardContainer.setAttribute(attr.name, attr.value),
    );

    genCardContainer.innerHTML = `
    <div class="light-teaser buyers-guide-teaser">
      <div class="teaser__card ${textClass || ''}">
        <div class="teaser__content">
          <div class="teaser__info">
            <div class="teaser__title">${title ? `<p>${title}</p>` : ''}</div>
            <div class="teaser__description">${description ? `<p>${description}</p>` : ''
}</div>
          </div>
          <div class="teaser__actions">${a ? a.outerHTML : ''}</div>
        </div>
      </div>
    </div>
  `;

    return genCardContainer.outerHTML;
  }
  // Destructure block's children into respective variables
  const [
    titleEL,
    typeEL,
    descriptionEL,
    ctaEl,
    ctaTargetEL,
    ctaIconEL,
    ...offerItems
  ] = block.children;

  // Extract and trim text content or set default values if elements do not exist
  const title = titleEL?.innerText?.trim() || '';
  const type = typeEL?.innerText?.trim() || '';
  const description = descriptionEL?.innerText?.trim() || '';
  const a = ctaEl?.querySelector('.button-container a') || '';
  const target = ctaTargetEL?.innerText?.trim() || '';
  const btnIcon = ctaIconEL?.querySelector('img') || '';

  // Create offer cards
  const primaryCard = offerItems[0] ? createPrimaryOffer(offerItems[0]) : '';
  const secondaryCard = offerItems[1]
    ? createSecondaryOffer(offerItems[1])
    : '';
  const generalCard1 = offerItems[2]
    ? createGeneralOffer(offerItems[2], 'teaser-light')
    : '';
  const generalCard2 = offerItems[3]
    ? createGeneralOffer(offerItems[3], 'teaser-dark')
    : '';

  // Modify link element if it exists
  if (a) {
    a.classList.remove('button');
    a.classList.add('btn--link', 'btn--link-primary');
    if (target) {
      a.setAttribute('target', target);
    }
    a.innerHTML = `${a.innerText} <span>${btnIcon ? btnIcon.outerHTML : ''
    }</span>`;
  }

  // Only build componentHTML when both title and description are present
  let componentHTML = '';
  if (title && description) {
    componentHTML = `
        <div class="offerList__content heading-content">
          ${type ? `<${type}>${title}</${type}>` : ''}
          <p>${description}</p>
          <div class="offerList__action-btn">
            ${a ? a.outerHTML : ''}
          </div>
        </div>
      `;
  }

  // Set the innerHTML of the block with a new structure
  block.innerHTML = utility.sanitizeHtml(`
  <section class="deals-offers-container">
        <div class="offerList__wrapper-light">
            ${componentHTML}
            <div class="sub-container">
                ${primaryCard}
                <div class="right-container">
                    ${secondaryCard}
                    <div class="right-container-subcontainer">
                        ${generalCard1}
                        ${generalCard2}
                    </div>
                </div>
            </div>
        </div>              
    </section>
  `);

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};
    pageDetails.componentName = block.getAttribute('data-block-name');
    if (e.target.closest('.teaser__content')) {
      pageDetails.componentTitle = e.target.closest('.teaser__content').querySelector('.teaser__title')?.textContent;
    } else if (e.target.closest('.right-container__content')) {
      pageDetails.componentTitle = e.target.closest('.right-container__content').querySelector('.teaser__title')?.textContent;
    }
    pageDetails.componentType = 'button';
    pageDetails.webName = e.target?.textContent;
    pageDetails.linkType = e.target;

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.teaser__action-btn') || e.target.closest('.teaser__actions') || e.target.closest('.offerList__action')) {
      setLinkDetails(e);
    }
  });
}
